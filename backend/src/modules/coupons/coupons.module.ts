/**
 * İndirim kuponları. Controller uçları YALNIZCA admin (kupon yönetimi).
 * Asıl değer `CouponsService.validateForOrder` — cart (checkout-preview) ve
 * orders (sipariş oluşturma) bunu çağırır; bu yüzden servis export edilir.
 */
import { Module } from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CouponsController } from './coupons.controller';

@Module({
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService],
})
export class CouponsModule {}
