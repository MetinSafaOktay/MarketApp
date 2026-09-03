/**
 * Kimlik doğrulama modülü: kayıt / giriş / token yenileme / çıkış / "ben kimim".
 * - JwtModule: access token'ları JWT_SECRET ile İMZALAMAK için (auth.service)
 * - PassportModule + JwtStrategy: gelen token'ları DOĞRULAMAK için (JwtAuthGuard)
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    // registerAsync: secret'ı ConfigService'ten (doğrulanmış env) çekmek için
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
