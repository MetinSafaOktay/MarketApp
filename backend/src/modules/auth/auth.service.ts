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
const SALT_ROUNDS = 10;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private async issueTokens(userId: string, role: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId, role },
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
    );

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token_hash: hashToken(refreshToken),
        expires_at: expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

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
      data: { last_active_at: new Date() },
    });

    const tokens = await this.issueTokens(user.id, user.role);
    return { user: this.sanitizeUser(user), ...tokens };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    const stored = await this.prisma.refresh_tokens.findUnique({
      where: { token_hash: tokenHash },
    });

    if (
      !stored ||
      stored.revoked_at ||
      stored.expires_at.getTime() < Date.now()
    ) {
      throw new UnauthorizedException(
        'Refresh token geçersiz veya süresi dolmuş',
      );
    }

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

    return this.issueTokens(user.id, user.role);
  }

  async me(userId: string) {
    const user = await this.prisma.users.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.sanitizeUser(user);
  }

  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await this.prisma.refresh_tokens.updateMany({
      where: { token_hash: tokenHash, revoked_at: null },
      data: { revoked_at: new Date() },
    });
    return { success: true };
  }

  private sanitizeUser(user: {
    password_hash: string;
    [key: string]: unknown;
  }) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash, ...rest } = user;
    return rest;
  }
}
