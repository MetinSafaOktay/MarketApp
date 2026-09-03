/**
 * POST /announcements gövdesi (admin). `title` opsiyonel, `content` zorunlu
 * ve `content.tr` dolu olmalı. `image_url` storage modülünden gelir.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUrl } from 'class-validator';
import { IsTranslatedText } from '../../../common/i18n/is-translated-text.validator';
import type { TranslatedText } from '../../../common/i18n/locales';

export class CreateAnnouncementDto {
  @ApiPropertyOptional({
    description: 'Çok dilli başlık, ör. { "tr": "...", "en": "..." }',
  })
  @IsOptional()
  @IsTranslatedText({ maxLength: 255 })
  title?: TranslatedText;

  @ApiProperty({
    description: 'Çok dilli içerik — tr zorunlu',
    example: { tr: 'Kupon Kodu: ilksiparis10' },
  })
  @IsTranslatedText({ requireDefault: true })
  content: TranslatedText;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  image_url?: string;
}
