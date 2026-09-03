/**
 * Duyurular — storefront ana sayfasındaki kampanya/haber kartları.
 * GET herkese açık, yazma admin. `title`/`content` çok dilli (`content.tr` zorunlu).
 */
import { Module } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { AnnouncementsController } from './announcements.controller';

@Module({
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
