import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStoreDto } from './dto/update-store.dto';
import { DEFAULT_LOCALE, Locale } from '../../common/i18n/locales';
import { localizeFields } from '../../common/i18n/localize';

const I18N_FIELDS = ['tagline', 'description'] as const; // çok dilli jsonb kolonlar

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  // store_profile tek satırdır; hiç yoksa bir kez seed'ler (ilk kurulum kolaylığı)
  private async getRaw() {
    const existing = await this.prisma.store_profile.findFirst();
    if (existing) return existing;
    return this.prisma.store_profile.create({
      data: { name: 'Erenler Market' },
    });
  }

  async get(locale: Locale = DEFAULT_LOCALE, raw = false) {
    const profile = await this.getRaw();
    // raw değilse tagline/description tek dile indirilir
    return raw ? profile : localizeFields(profile, locale, I18N_FIELDS);
  }

  async update(dto: UpdateStoreDto) {
    const existing = await this.getRaw();
    return this.prisma.store_profile.update({
      where: { id: existing.id },
      data: dto as Prisma.store_profileUpdateInput,
    });
  }
}
