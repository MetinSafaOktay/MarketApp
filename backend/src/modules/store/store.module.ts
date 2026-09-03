/**
 * Mağaza profili (tek satır): ad, şehir, slogan/açıklama (çok dilli), logo, adres,
 * telefon, çalışma saatleri. Storefront başlığı/hakkında sayfası bunu okur;
 * yalnızca admin güncelleyebilir. "Erenler Market" ismi burada tutulur (hardcode değil).
 */
import { Module } from '@nestjs/common';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
})
export class StoreModule {}
