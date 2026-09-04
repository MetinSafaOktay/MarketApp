/**
 * Ters geocoding. Nominatim (OpenStreetMap) çağrısı sunucudan yapılır —
 * tek kimlik (User-Agent), 24 saatlik bellek-içi cache, IP başına dk/20 limit.
 */
import { Module } from '@nestjs/common';
import { GeoController } from './geo.controller';
import { GeoService } from './geo.service';

@Module({
  controllers: [GeoController],
  providers: [GeoService],
})
export class GeoModule {}
