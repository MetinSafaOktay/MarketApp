/**
 * PATCH /products/:id — CreateProductDto'nun tüm alanları opsiyonel, AMA `images`
 * hariç tutulur: görseller ancak /:id/images uçlarıyla yönetilir (tek tek + sıra).
 */
import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['images'] as const),
) {}
