/**
 * Kullanıcı profili modülü: profil güncelleme, hesap silme (yumuşak),
 * herkese açık profil görüntüleme ve takip et/bırak.
 * (Kimlik/oturum işleri auth modülünde; burası "hesabım/sosyal" tarafı.)
 */
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
