import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Min,
} from 'class-validator';
import { IsTranslatedText } from '../../../common/i18n/is-translated-text.validator';
import type { TranslatedText } from '../../../common/i18n/locales';

/**
 * POST /products gövdesi (admin). `name`/`description` çok dilli (`name.tr` zorunlu).
 * `price`/`original_price` sayı gelir; DB'de Decimal → yanıtlarda string döner.
 * `images` sadece OLUŞTURMADA var (opsiyonel başlangıç listesi); sonradan
 * görsel eklemek için ayrı uç: POST /products/:id/images.
 */
export class CreateProductDto {
  @ApiProperty()
  @IsUUID()
  category_id: string;

  @ApiProperty({
    description:
      'Çok dilli ürün adı, ör. { "tr": "...", "en": "..." } — tr zorunlu',
    example: { tr: 'Koska Sade Tahin Helvası 200 Gr' },
  })
  @IsTranslatedText({ requireDefault: true, maxLength: 255 })
  name: TranslatedText;

  @ApiProperty({ description: 'Stok kodu (SKU), benzersiz olmalı' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({
    description: 'Çok dilli açıklama, ör. { "tr": "...", "de": "..." }',
  })
  @IsOptional()
  @IsTranslatedText()
  description?: TranslatedText;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({
    description: "Doluysa ve price'tan büyükse ürün indirimli sayılır",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  original_price?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_new_arrival?: boolean;

  @ApiPropertyOptional({
    default: true,
    description: 'false → ürün storefront listesinde görünmez',
  })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_quantity?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Başlangıç ürün görseli URL listesi',
  })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  images?: string[];
}
