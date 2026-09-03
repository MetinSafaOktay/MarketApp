/**
 * Müşteri ↔ mağaza mesajlaşması. Her müşterinin TEK bir konuşması var
 * (grup/çoklu thread yok). Realtime yerine POLLING: istemci 5 sn'de bir
 * `/conversations/me` çeker (Vercel serverless'ta kalıcı WebSocket olmadığı için).
 * Controller: `/conversations/me*` müşteri, `/conversations` + `/conversations/:id*` admin.
 */
import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule], // mağaza yanıt yazınca müşteriye bildirim düşer
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
