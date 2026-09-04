/**
 * PATCH /store gövdesi (yalnızca admin). Hepsi opsiyonel — kısmi güncelleme.
 * `tagline` / `description` çok dilli: { "tr": "...", "en": "..." } biçiminde,
 * `@IsTranslatedText` ile doğrulanır. `working_hours` şimdilik serbest JSON.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { IsTranslatedText } from '../../../common/i18n/is-translated-text.validator';
import type { TranslatedText } from '../../../common/i18n/locales';

export class UpdateStoreDto {
  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Çok dilli slogan' })
  @IsOptional()
  @IsTranslatedText({ maxLength: 255 })
  tagline?: TranslatedText;

  @ApiPropertyOptional({ description: 'Çok dilli açıklama' })
  @IsOptional()
  @IsTranslatedText()
  description?: TranslatedText;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  logo_url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  cover_image_url?: string;

  @ApiPropertyOptional({ maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'Gün bazlı çalışma saatleri (serbest JSON)',
  })
  @IsOptional()
  @IsObject()
  working_hours?: Record<string, unknown>;

  // --- Teslimat bölgesi (kuş uçuşu). Üçü birden dolu değilse kısıt kapalı;
  //     null göndererek temizlenebilir (@IsOptional null'ı da atlar). ---

  @ApiPropertyOptional({ description: 'Mağaza enlemi', example: 38.7569 })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({ description: 'Mağaza boylamı', example: 30.5387 })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number | null;

  @ApiPropertyOptional({ description: 'Teslimat yarıçapı (km)', example: 5 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  delivery_radius_km?: number | null;
}
