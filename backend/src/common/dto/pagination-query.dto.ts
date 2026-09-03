import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Sayfalama query parametreleri için ortak temel DTO (`?page=&pageSize=`).
 * Liste endpoint'leri bunu extend edip kendi filtre alanlarını ekler
 * (bkz. list-products-query.dto.ts). `@Type(() => Number)` gerekli çünkü
 * query string'de her şey metindir.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
