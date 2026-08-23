import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateMyConversation(userId: string) {
    const existing = await this.prisma.conversations.findFirst({
      where: { user_id: userId },
    });
    if (existing) return existing;
    return this.prisma.conversations.create({ data: { user_id: userId } });
  }

  async getMyMessages(userId: string) {
    const conversation = await this.getOrCreateMyConversation(userId);
    await this.prisma.messages.updateMany({
      where: {
        conversation_id: conversation.id,
        sender_type: 'store',
        is_read: false,
      },
      data: { is_read: true },
    });
    return this.prisma.messages.findMany({
      where: { conversation_id: conversation.id },
      orderBy: { created_at: 'asc' },
    });
  }

  async sendMyMessage(userId: string, dto: SendMessageDto) {
    const conversation = await this.getOrCreateMyConversation(userId);
    return this.prisma.messages.create({
      data: {
        conversation_id: conversation.id,
        sender_type: 'user',
        content: dto.content,
      },
    });
  }

  listAllConversations() {
    return this.prisma.conversations.findMany({
      include: {
        users: {
          select: { id: true, profile_name: true, profile_photo_url: true },
        },
        messages: { orderBy: { created_at: 'desc' as const }, take: 1 },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getConversationMessages(conversationId: string) {
    const conversation = await this.prisma.conversations.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Sohbet bulunamadı');

    await this.prisma.messages.updateMany({
      where: {
        conversation_id: conversationId,
        sender_type: 'user',
        is_read: false,
      },
      data: { is_read: true },
    });
    return this.prisma.messages.findMany({
      where: { conversation_id: conversationId },
      orderBy: { created_at: 'asc' },
    });
  }

  async reply(conversationId: string, dto: SendMessageDto) {
    const conversation = await this.prisma.conversations.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Sohbet bulunamadı');

    return this.prisma.messages.create({
      data: {
        conversation_id: conversationId,
        sender_type: 'store',
        content: dto.content,
      },
    });
  }
}
