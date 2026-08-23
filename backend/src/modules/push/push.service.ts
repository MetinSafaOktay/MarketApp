import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webpush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

export interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);
  private readonly isConfigured: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT');

    this.isConfigured = Boolean(publicKey && privateKey && subject);
    if (this.isConfigured) {
      webpush.setVapidDetails(subject!, publicKey!, privateKey!);
    } else {
      this.logger.warn(
        'VAPID anahtarları tanımlı değil, push bildirimleri devre dışı',
      );
    }
  }

  subscribe(userId: string, dto: SubscribeDto) {
    return this.prisma.push_subscriptions.upsert({
      where: { endpoint: dto.endpoint },
      create: { user_id: userId, ...dto },
      update: { user_id: userId, ...dto },
    });
  }

  async unsubscribe(userId: string, endpoint: string) {
    await this.prisma.push_subscriptions.deleteMany({
      where: { user_id: userId, endpoint },
    });
    return { success: true };
  }

  async sendToUser(userId: string, payload: PushPayload) {
    if (!this.isConfigured) return;

    const subscriptions = await this.prisma.push_subscriptions.findMany({
      where: { user_id: userId },
    });

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh_key, auth: sub.auth_key },
            },
            JSON.stringify(payload),
          );
        } catch (error) {
          const statusCode = (error as { statusCode?: number }).statusCode;
          if (statusCode === 404 || statusCode === 410) {
            await this.prisma.push_subscriptions.delete({
              where: { id: sub.id },
            });
          } else {
            this.logger.warn(`Push gönderilemedi: ${String(error)}`);
          }
        }
      }),
    );
  }
}
