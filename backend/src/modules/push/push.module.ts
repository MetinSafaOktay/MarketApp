/**
 * Web Push (VAPID) abonelikleri. Controller: tarayıcı service worker aboneliğini
 * kaydeder/siler. Service: `sendToUser` — NotificationsService bunu çağırır.
 * VAPID env'i yoksa modül yüklenir ama sessizce devre dışı kalır.
 * NOT: mobil push (FCM/APNs) burada YOK — mobil v1 polling kullanır.
 */
import { Module } from '@nestjs/common';
import { PushService } from './push.service';
import { PushController } from './push.controller';

@Module({
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
