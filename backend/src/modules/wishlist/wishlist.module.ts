/**
 * İstek listesi (favoriler). Sepetin sadeleştirilmiş hâli — adet yok, sadece
 * "ürün ekli mi". `wishlist_items` tablosu, (user_id, product_id) unique.
 */
import { Module } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';

@Module({
  controllers: [WishlistController],
  providers: [WishlistService],
})
export class WishlistModule {}
