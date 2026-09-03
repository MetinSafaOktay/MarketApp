/**
 * POST /cart/items gövdesi. `quantity` verilmezse 1. Ürün zaten sepetteyse
 * service adet üstüne ekler (yeni satır açmaz).
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class AddCartItemDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;
}
