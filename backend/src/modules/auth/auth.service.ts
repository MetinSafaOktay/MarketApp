/**
 * Kimlik doğrulamanın tüm iş mantığı.
 *
 * Token modeli (istemcilerle aynı):
 *  - ACCESS  : JWT, 15 dk, payload { sub: userId, role }. Her istekte Bearer başlığı.
 *  - REFRESH : rastgele 64 byte hex. DB'de YALNIZCA sha256 hash'i saklanır (ham hali asla).
 *              7 gün geçerli, her kullanımda ROTASYON: eski iptal, yeni verilir.
 *  - logout / hesap kapatma → ilgili refresh token'lar `revoked_at` ile iptal edilir.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 7;
const SALT_ROUNDS = 10; // bcrypt maliyet faktörü

/** Refresh token DB'ye hep hash'lenmiş girer — sızıntı olsa bile ham token çıkmaz. */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /** Yeni bir access+refresh çifti üretir ve refresh'i (hash'li) DB'ye yazar. */
  private async issueTokens(userId: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, role }, // guard'lar bu payload'a bakar
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(64).toString('hex'); // tahmin edilemez
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token_hash: hashToken(refreshToken), // ham token DB'ye GİRMEZ
        expires_at: expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /** email/phone'dan hangisi verildiyse ona göre `where OR` koşulu kurar. */
  private identifierWhere(dto: {
    email?: string;
    phone?: string;
  }): Prisma.usersWhereInput['OR'] {
    const conditions: Prisma.usersWhereInput[] = [];
    if (dto.email) conditions.push({ email: dto.email });
    if (dto.phone) conditions.push({ phone: dto.phone });
    return conditions;
  }

  async register(dto: RegisterDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'email veya phone alanlarından en az biri zorunlu',
      );
    }

    const existing = await this.prisma.users.findFirst({
      where: { OR: this.identifierWhere(dto) },
    });
    if (existing) {
      throw new ConflictException('Bu email/telefon zaten kayıtlı');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.prisma.users.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        password_hash,
        profile_name: dto.profile_name,
        first_name: dto.first_name,
        last_name: dto.last_name,
      },
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async login(dto: LoginDto) {
    if (!dto.email && !dto.phone) {
      throw new BadRequestException(
        'email veya phone alanlarından en az biri zorunlu',
      );
    }

    const user = await this.prisma.users.findFirst({
      where: { OR: this.identifierWhere(dto) },
    });

    // "kullanıcı yok" ile "parola yanlış" aynı mesajı döner — hesap sayımını (enumeration) zorlaştırır
    if (
      !user ||
      !user.password_hash ||
      !(await bcrypt.compare(dto.password, user.password_hash))
    ) {
      throw new UnauthorizedException('Geçersiz kimlik bilgileri');
    }
    if (!user.is_active) {
      throw new UnauthorizedException('Bu hesap kapatılmış');
    }

    await this.prisma.users.update({
      where: { id: user.id },
      data: { last_active_at: new Date() }, // "son görülme" — admin müşteri listesi kullanır
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken); // DB'de hash aranır
    const stored = await this.prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    // bilinmeyen / daha önce iptal edilmiş / süresi geçmiş → 401
    if (
      !stored ||
      stored.revoked_at ||
      stored.expires_at.getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        'Refresh token geçersiz veya süresi dolmuş',
      );
    }

    // ROTASYON: bu token'ı hemen iptal et (tekrar kullanılamaz)
    await this.prisma.refresh_tokens.update({
      where: { id: stored.id },
      data: { revoked_at: new Date() },
    });

    const user = await this.prisma.users.findUniqueOrThrow({
      where: { id: stored.user_id },
    });
    if (!user.is_active) {
      throw new UnauthorizedException('Bu hesap kapatılmış');
    }

    return this.issueTokens(user.id, user.role); // taze çift
  }

  /** GET /auth/me — güncel, şifresi ayıklanmış kullanıcı. */
  async me(userId: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.sanitizeUser(user);
  }

  /** Verilen refresh token hâlâ aktifse iptal eder (yoksa sessizce geçer). */
  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refresh_tokens.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    return { success: true };
  }

  /** password_hash'i yanıttan çıkarır — istemciye ASLA şifre hash'i gitmez. */
  private sanitizeUser(user: {
    password_hash: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...rest } = user;
    return rest;
  }
}
