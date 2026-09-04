/**
 * Sepet modülü. Sepet sunucuda tutulur (istemci sadece yansıtır).
 * - items ekle/güncelle/sil/temizle
 * - checkout-preview: sipariş vermeden önce satır toplamları + kupon + stok uyarısı
 * CouponsModule import edilir çünkü checkout-preview kupon doğrulamasını ondan çağırır.
 * CartService export edilir çünkü orders modülü sipariş sonrası sepeti temizler.
 */
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { CouponsModule } from '../coupons/coupons.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [CouponsModule, StoreModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
