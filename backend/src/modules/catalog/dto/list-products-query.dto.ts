import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export const PRODUCT_SORTS = ['newest', 'price_asc', 'price_desc'] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

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
