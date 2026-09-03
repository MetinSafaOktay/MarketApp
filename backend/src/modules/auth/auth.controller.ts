import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator';

/**
 * /auth uçları. Kayıt/giriş/yenileme herkese açık (guard yok); yalnızca `/auth/me`
 * geçerli access token ister. İş mantığı auth.service'te — controller sadece yönlendirir.
 * Sınıf üzerindeki @Throttle bütün metotlara uygulanır.
 */
// Kimlik uçları brute-force'a açık; genel sınırdan daha sıkı (dakikada 10 istek).
@Throttle({ default: { limit: 10, ttl: 60_000 } })
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Yeni hesap + ilk token çifti. email VEYA phone zorunlu (ikisi de olabilir).
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  // @HttpCode(200): POST varsayılan 201'dir; giriş "kaynak yaratmadığı" için 200.
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Rotating refresh: eski token iptal edilir, yeni access+refresh çifti döner.
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // Verilen refresh token'ı iptal eder (access token 15 dk sonra kendi düşer).
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  // Oturumdaki kullanıcının güncel profili. İstemciler açılışta bununla token doğrular.
  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() currentUser: CurrentUserPayload) {
    return this.authService.me(currentUser.userId);
  }
}
