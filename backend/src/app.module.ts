/**
 * Kök modül. Tüm domain modüllerini (auth, catalog, orders...) tek bir uygulama
 * grafiğinde toplar ve uygulama geneli davranışları kurar:
 *  - ConfigModule: .env okuma + açılışta doğrulama (validateEnv)
 *  - ThrottlerModule + global ThrottlerGuard: hız sınırlama
 * Her domain kendi `modules/<ad>/<ad>.module.ts` dosyasında; buraya sadece eklenir.
 */
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { UserSettingsModule } from './modules/user-settings/user-settings.module';
import { StoreModule } from './modules/store/store.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { CartModule } from './modules/cart/cart.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AnnouncementsModule } from './modules/announcements/announcements.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PushModule } from './modules/push/push.module';
import { AdminModule } from './modules/admin/admin.module';
import { StorageModule } from './modules/storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // her modülde ayrıca import etmeye gerek yok
      validate: validateEnv, // eksik/hatalı env varsa uygulama hiç açılmaz
    }),
    // Genel sınır: IP başına 60 sn'de 100 istek. Kimlik uçları auth.controller'da
    // @Throttle ile daha da sıkı. Not: Vercel serverless'ta bellek-içi sayaç her
    // instance'a özel; tam koruma için Redis/Upstash deposu gerekir.
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
    }),
    PrismaModule, // @Global — DB erişimi (PrismaService) tüm modüllere açık
    AuthModule,
    UsersModule,
    AddressesModule,
    UserSettingsModule,
    StoreModule,
    CatalogModule,
    CartModule,
    WishlistModule,
    CouponsModule,
    OrdersModule,
    AnnouncementsModule,
    MessagingModule,
    NotificationsModule,
    PushModule,
    AdminModule,
    StorageModule,
  ],
  controllers: [AppController],
  // APP_GUARD: bu guard TÜM route'larda otomatik çalışır (tek tek eklemeye gerek yok)
  providers: [AppService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
