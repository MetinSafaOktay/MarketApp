import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const existing = await this.prisma.user_settings.findUnique({
      where: { user_id: userId },
    });
    if (existing) return existing;
    return this.prisma.user_settings.create({ data: { user_id: userId } });
  }

  async update(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.user_settings.upsert({
      where: { user_id: userId },
      create: { user_id: userId, ...dto },
      update: dto,
    });
  }
}
