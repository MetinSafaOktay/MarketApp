/**
 * Admin dashboard verisi: özet istatistikler, müşteri listesi (aramalı), düşük stok.
 * Ürün/kategori/sipariş/kupon YÖNETİMİ burada değil — kendi modüllerinde,
 * @Roles('admin') ile. Bu modül yalnızca "gösterge paneli" okuma uçları.
 */
import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
