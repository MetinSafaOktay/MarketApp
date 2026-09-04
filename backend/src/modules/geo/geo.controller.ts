import { Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import { GeoService } from './geo.service';
import { ReverseGeocodeQueryDto } from './dto/reverse-geocode-query.dto';

/**
 * Ters geocoding (koordinat → adres metni). İstemci harita seçicide pin
 * bırakınca çağırır; form alanlarını ön-doldurmak için. Sonuç OpenStreetMap
 * (Nominatim) verisidir — TR'de il/ilçe/mahalle çoğunlukla doğru, bina no eksik.
 */
@ApiTags('geo')
@Controller('geo')
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  // Nominatim'e saygı + kötüye kullanımı engelle: dakikada 20 istek / IP.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Get('reverse')
  reverse(@Query() query: ReverseGeocodeQueryDto) {
    return this.geoService.reverse(query.lat, query.lng);
  }
}
