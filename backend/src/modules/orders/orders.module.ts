/**
 * Sipariş modülü.
 *  - müşteri: sipariş oluştur, kendi siparişlerini listele/gör, iptal et (erken)
 *  - admin: tüm siparişleri gör, durum güncelle (zaman çizelgesi)
 * CouponsModule → sipariş anında kupon indirimini yeniden doğrular.
 * NotificationsModule → durum değişince müşteriye bildirim düşer.
 * StoreModule → teslimat bölgesi (yarıçap) kontrolü.
 */
import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersAdminController } from './orders-admin.controller';
import { CouponsModule } from '../coupons/coupons.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [CouponsModule, NotificationsModule, StoreModule],
  controllers: [OrdersController, OrdersAdminController],
  providers: [OrdersService],
})
export class OrdersModule {}
