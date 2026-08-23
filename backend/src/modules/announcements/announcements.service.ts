import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.announcements.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
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
    await this.findOne(id);
    return this.prisma.announcements.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.announcements.delete({ where: { id } });
    return { success: true };
  }
}
