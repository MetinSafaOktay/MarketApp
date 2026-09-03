/**
 * Kullanıcı tercihleri: dil, tema, bildirim aç/kapa.
 * `user_settings` her kullanıcı için 1 satır; yoksa ilk okumada varsayılanlarla yaratılır.
 */
import { Module } from '@nestjs/common';
import { UserSettingsService } from './user-settings.service';
import { UserSettingsController } from './user-settings.controller';

@Module({
  controllers: [UserSettingsController],
  providers: [UserSettingsService],
})
export class UserSettingsModule {}
