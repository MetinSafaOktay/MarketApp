import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CheckoutPreviewDto {
  @ApiPropertyOptional({ description: 'Uygulanacak kupon kodu (opsiyonel)' })
  @IsOptional()
  @IsString()
  coupon_code?: string;
}
