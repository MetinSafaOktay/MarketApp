/**
 * Katalog modülü — iki alt alan:
 *  - categories: kategori CRUD + listeleme
 *  - products: ürün CRUD + storefront listeleme (arama/sıralama/filtre/sayfalama),
 *    ürün detayı, benzer ürünler, ürün görselleri
 * Storefront GET'leri herkese açık; yazma uçları admin.
 */
import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  controllers: [CategoriesController, ProductsController],
  providers: [CategoriesService, ProductsService],
})
export class CatalogModule {}
