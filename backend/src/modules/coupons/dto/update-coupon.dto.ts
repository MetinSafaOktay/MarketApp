/** PATCH /coupons/:id — CreateCouponDto'nun tüm alanları opsiyonel. */
import { PartialType } from '@nestjs/swagger';
import { CreateCouponDto } from './create-coupon.dto';

export class UpdateCouponDto extends PartialType(CreateCouponDto) {}
