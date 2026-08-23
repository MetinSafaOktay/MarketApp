import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PushService } from '../push/push.service';
import { CreateNotificationInput } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pushService: PushService,
  ) {}

  async create(input: CreateNotificationInput) {
    const notification = await this.prisma.notifications.create({
      data: input,
    });

    await this.pushService.sendToUser(input.user_id, {
      title: input.title,
      body: input.body ?? '',
      data: { related_order_id: input.related_order_id },
    });

    return notification;
  }

  listMine(userId: string) {
    return this.prisma.notifications.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
  }

  async markRead(userId: string, id: string) {
    const notification = await this.prisma.notifications.findUnique({
      where: { id },
    });
    if (!notification || notification.user_id !== userId) {
      throw new NotFoundException('Bildirim bulunamadı');
    }
    return this.prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notifications.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }
}
