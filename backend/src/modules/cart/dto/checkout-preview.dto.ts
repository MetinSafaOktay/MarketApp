/**
 * POST /cart/checkout-preview gövdesi. Sadece opsiyonel kupon kodu.
 * Kod geçersizse istek PATLAMAZ — yanıtta `coupon_error` alanı döner
 * (istemci indirimsiz devam edebilsin).
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckoutPreviewDto {
  @ApiPropertyOptional({ description: 'Uygulanacak kupon kodu (opsiyonel)' })
  @IsOptional()
  @IsString()
  coupon_code?: string;

  @ApiPropertyOptional({
    description:
      'Seçili teslimat adresi (opsiyonel) — verilirse yanıtta teslimat bölgesi bilgisi döner',
  })
  @IsOptional()
  @IsUUID()
  address_id?: string;
}
