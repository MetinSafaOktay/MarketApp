/** POST /wishlist/items gövdesi — sadece ürün id'si (adet yok). */
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddWishlistItemDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;
}
