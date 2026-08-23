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

export class CreateProductDto {
  @ApiProperty()
  @IsUUID()
  category_id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'Stok kodu (SKU), benzersiz olmalı' })
  @IsString()
  sku: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

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
