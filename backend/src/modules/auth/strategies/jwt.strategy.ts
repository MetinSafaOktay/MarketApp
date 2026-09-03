/**
 * Passport "jwt" stratejisi — JwtAuthGuard bunu kullanır.
 * Authorization: Bearer <token> başlığından JWT'yi çıkarır, JWT_SECRET ile
 * imzayı ve süreyi doğrular. Başarılıysa `validate()` sonucu request.user olur.
 * DB'ye BAKMAZ; token payload'ı (sub + role) yeterli kabul edilir — hız için.
 */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

export interface JwtPayload {
  sub: string; // users.id
  role: string; // 'customer' | 'admin'
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // süresi dolmuş token'ı reddet (401)
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  // Dönen nesne CurrentUserPayload biçimindedir; @CurrentUser() bunu enjekte eder.
  validate(payload: JwtPayload) {
    return { userId: payload.sub, role: payload.role };
  }
}
