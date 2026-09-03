import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class UserSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  // İlk okumada satır yoksa DB varsayılanlarıyla (dil=tr, tema=dark, bildirimler açık) yarat
  async get(userId: string) {
    const existing = await this.prisma.user_settings.findUnique({
      where: { user_id: userId },
    });
    if (existing) return existing;
    return this.prisma.user_settings.create({ data: { user_id: userId } });
  }

  // upsert: satır varsa güncelle, yoksa oluştur. dto yalnızca gönderilen alanları taşır.
  async update(userId: string, dto: UpdateSettingsDto) {
    return this.prisma.user_settings.upsert({
      where: { user_id: userId },
      create: { user_id: userId, ...dto },
      update: dto,
    });
  }
}
