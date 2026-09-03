/** Mesajlaşma iş mantığı. `sender_type`: 'user' (müşteri) | 'store' (mağaza/admin). */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/send-message.dto';

/** Bildirim gövdesinde gösterilecek kısa önizleme uzunluğu. */
const PREVIEW_LEN = 120;

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // Müşterinin konuşması yoksa ilk mesajda/okumada yaratılır (tembel oluşturma)
  private async getOrCreateMyConversation(userId: string) {
    const existing = await this.prisma.conversations.findFirst({
      where: { user_id: userId },
    });
    if (existing) return existing;
    return this.prisma.conversations.create({ data: { user_id: userId } });
  }

  async getMyMessages(userId: string) {
    const conversation = await this.getOrCreateMyConversation(userId);
    // Müşteri sohbeti açtı → mağazadan gelen mesajları "okundu" yap
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
      orderBy: { created_at: 'asc' }, // eskiden yeniye (sohbet akışı)
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

  // Admin gelen kutusu: her konuşma + kullanıcı özeti + SON mesaj (önizleme)
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

  // Admin bir sohbeti açtı → müşteriden gelen mesajları "okundu" yap
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

    const message = await this.prisma.messages.create({
      data: {
        conversation_id: conversationId,
        sender_type: 'store',
        content: dto.content,
      },
    });

    // Konuşma sahibine "yeni mesaj" bildirimi (zil listesi + web push denemesi).
    // Hata olsa bile yanıt kaydı kalır (create içinde yakalanır).
    await this.notificationsService.create({
      user_id: conversation.user_id,
      type: 'new_message',
      title: 'Mağazadan yeni mesaj',
      body:
        dto.content.length > PREVIEW_LEN
          ? `${dto.content.slice(0, PREVIEW_LEN)}…`
          : dto.content,
    });

    return message;
  }
}
