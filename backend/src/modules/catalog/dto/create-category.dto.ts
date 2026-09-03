/**
 * POST /categories gövdesi (admin). `name` çok dilli ve `tr` ZORUNLU
 * (requireDefault). `display_order` menüdeki sırayı belirler.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUrl, Min } from 'class-validator';
import { IsTranslatedText } from '../../../common/i18n/is-translated-text.validator';
import type { TranslatedText } from '../../../common/i18n/locales';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Çok dilli kategori adı — tr zorunlu',
    example: { tr: 'Atıştırmalık', en: 'Snacks' },
  })
  @IsTranslatedText({ requireDefault: true, maxLength: 100 })
  name: TranslatedText;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  display_order?: number;
}
