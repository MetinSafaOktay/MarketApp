/**
 * Uygulama içi bildirimler (zil ikonu). `NotificationsService.create` DB'ye satır
 * yazar VE (PushModule üzerinden) web-push dener. Diğer modüller (orders) bunu
 * çağırdığı için service export edilir. Müşteri okuma uçları controller'da.
 */
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PushModule } from '../push/push.module';

@Module({
  imports: [PushModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
