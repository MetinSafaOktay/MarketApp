/**
 * POST /coupons gövdesi (admin). `discount_type`: 'percentage' | 'fixed'.
 *  - percentage → discount_value 0-100 (yüzde)
 *  - fixed → discount_value TL cinsinden sabit indirim
 * `min_order_amount`, `usage_limit_per_user`, `valid_from/until` sınırları
 * validateForOrder() tarafından uygulanır.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { discount_type } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCouponDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty({ enum: discount_type })
  @IsEnum(discount_type)
  discount_type: discount_type;

  @ApiProperty({ description: 'percentage ise 0-100 arası, fixed ise TL' })
  @IsNumber()
  @Min(0)
  discount_value: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  min_order_amount?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  usage_limit_per_user?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  valid_from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  valid_until?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
