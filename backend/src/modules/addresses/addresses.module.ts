/**
 * Kullanıcının teslimat adres defteri (CRUD). Ödeme akışında adres seçimi bunları listeler.
 * Tüm uçlar giriş ister ve yalnızca kendi adreslerine erişim verir (sahiplik kontrolü).
 */
import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';

@Module({
  controllers: [AddressesController],
  providers: [AddressesService],
})
export class AddressesModule {}
