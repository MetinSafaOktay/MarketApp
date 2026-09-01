import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { DEFAULT_LOCALE, Locale } from '../../common/i18n/locales';
import { localizeFields, localizeList } from '../../common/i18n/localize';

const I18N_FIELDS = ['name'] as const;

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(locale: Locale = DEFAULT_LOCALE, raw = false) {
    const rows = await this.prisma.categories.findMany({
      orderBy: { display_order: 'asc' },
    });
    return raw ? rows : localizeList(rows, locale, I18N_FIELDS);
  }

  async findOne(id: string, locale: Locale = DEFAULT_LOCALE, raw = false) {
    const category = await this.getOrThrow(id);
    return raw ? category : localizeFields(category, locale, I18N_FIELDS);
  }

  private async getOrThrow(id: string) {
    const category = await this.prisma.categories.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Kategori bulunamadı');
    return category;
  }

  create(dto: CreateCategoryDto) {
    return this.prisma.categories.create({ data: dto });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.getOrThrow(id);
    return this.prisma.categories.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.getOrThrow(id);
    await this.prisma.categories.delete({ where: { id } });
    return { success: true };
  }
}
