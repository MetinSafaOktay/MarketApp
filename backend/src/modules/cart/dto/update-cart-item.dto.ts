/**
 * PATCH /cart/items/:productId gövdesi — mutlak adet (artış değil, "şu adete ayarla").
 * Min 1: 0'a indirmek yerine DELETE kullanılır.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity: number;
}
