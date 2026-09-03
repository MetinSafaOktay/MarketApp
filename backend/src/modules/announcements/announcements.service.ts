import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { DEFAULT_LOCALE, Locale } from '../../common/i18n/locales';
import { localizeFields, localizeList } from '../../common/i18n/localize';

/** Duyuru CRUD. list her zaman en yeniden eskiye; storefront ilk 3'ünü gösterir. */
const I18N_FIELDS = ['title', 'content'] as const;

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale = DEFAULT_LOCALE, raw = false) {
    const rows = await this.prisma.announcements.findMany({
      orderBy: { created_at: 'desc' },
    });
    return raw ? rows : localizeList(rows, locale, I18N_FIELDS);
  }

  async findOne(id: string, locale: Locale = DEFAULT_LOCALE, raw = false) {
    const announcement = await this.getOrThrow(id);
    return raw
      ? announcement
      : localizeFields(announcement, locale, I18N_FIELDS);
  }

  private async getOrThrow(id: string) {
    const announcement = await this.prisma.announcements.findUnique({
      where: { id },
    });
    if (!announcement) throw new NotFoundException('Duyuru bulunamadı');
    return announcement;
  }

  create(authorId: string, dto: CreateAnnouncementDto) {
    return this.prisma.announcements.create({
      data: { ...dto, author_id: authorId },
    });
  }

  async update(id: string, dto: UpdateAnnouncementDto) {
    await this.getOrThrow(id);
    return this.prisma.announcements.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.announcements.delete({ where: { id } });
    return { success: true };
  }
}
