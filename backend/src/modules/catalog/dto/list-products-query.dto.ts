/**
 * GET /products query parametreleri. PaginationQueryDto'yu (page/pageSize) genişletir.
 * B6'da eklendi — bundan önce endpoint düz dizi dönüyordu, artık { data, meta }.
 * Web mağaza listesi ve mobil `ProductQuery` bu alanları kullanır.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export const PRODUCT_SORTS = ['newest', 'price_asc', 'price_desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

// query'de "true"/"1"/true → boolean (checkbox filtreleri metin olarak gelir)
const toBool = ({ value }: { value: unknown }) =>
  value === true || value === 'true' || value === '1';

export class ListProductsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Kategori ID filtresi' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Ad veya stok kodunda arama' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: PRODUCT_SORTS, default: 'newest' })
  @IsOptional()
  @IsIn(PRODUCT_SORTS)
  sort?: ProductSort = 'newest';

  @ApiPropertyOptional({
    description: 'Sadece indirimli ürünler (original_price > price)',
  })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  onlyDiscounted?: boolean;

  @ApiPropertyOptional({ description: 'Sadece yeni ürünler' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  onlyNew?: boolean;

  @ApiPropertyOptional({ description: 'Sadece stokta olanlar' })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    description: 'Pasif ürünleri de dahil et (admin listesi için)',
  })
  @IsOptional()
  @Transform(toBool)
  @IsBoolean()
  includeInactive?: boolean;

  // Aşağıdakiler @Lang() / controller tarafından okunur; burada sadece
  // whitelist doğrulamasının isteği reddetmemesi için tanımlı.
  @ApiPropertyOptional({ description: 'Dil kodu (tr/en/de/fr/ar/nl)' })
  @IsOptional()
  @IsString()
  lang?: string;

  @ApiPropertyOptional({ description: 'true → ham çok dilli map döndür' })
  @IsOptional()
  @IsString()
  raw?: string;
}
