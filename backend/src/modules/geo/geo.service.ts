import { Injectable, Logger } from '@nestjs/common';

/** Koordinattan çözülen adres — istemci formu bunlarla ön-doldurur. */
export interface ResolvedAddress {
  found: boolean;
  /** "Mahalle Mah. Cadde No" biçiminde derlenmiş açık adres. */
  full_address: string;
  city: string; // il
  district: string; // ilçe
  neighbourhood: string; // mahalle
  road: string; // cadde / sokak
  house_number: string; // bina no (çoğu zaman boş gelir)
}

interface NominatimAddress {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  quarter?: string;
  suburb?: string;
  residential?: string;
  city_district?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  district?: string;
  city?: string;
  province?: string;
  state?: string;
}

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/reverse';
// Nominatim kullanım politikası: tanımlanabilir bir User-Agent şart.
const USER_AGENT =
  'ErenlerMarket/1.0 (https://github.com/MetinSafaOktay/MarketApp)';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 6000;

const EMPTY: ResolvedAddress = {
  found: false,
  full_address: '',
  city: '',
  district: '',
  neighbourhood: '',
  road: '',
  house_number: '',
};

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly cache = new Map<
    string,
    { value: ResolvedAddress; expires: number }
  >();

  async reverse(lat: number, lng: number): Promise<ResolvedAddress> {
    // ~11 m hassasiyette anahtar — yakın pinler aynı sonucu paylaşır.
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) return cached.value;

    const value = await this.fetchFromNominatim(lat, lng);
    this.cache.set(key, { value, expires: Date.now() + CACHE_TTL_MS });
    return value;
  }

  private async fetchFromNominatim(
    lat: number,
    lng: number,
  ): Promise<ResolvedAddress> {
    const url =
      `${NOMINATIM_URL}?format=jsonv2&addressdetails=1&zoom=18` +
      `&accept-language=tr&lat=${lat}&lon=${lng}`;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
        signal: controller.signal,
      });

      if (!res.ok) {
        this.logger.warn(`Nominatim ${res.status}`);
        return EMPTY;
      }

      const body = (await res.json()) as { address?: NominatimAddress };
      return this.map(body.address ?? {});
    } catch (error) {
      // Ağ hatası / zaman aşımı → istemci sadece otomatik doldurmaz, akış bozulmaz.
      this.logger.warn(
        `Nominatim başarısız: ${error instanceof Error ? error.message : error}`,
      );
      return EMPTY;
    } finally {
      clearTimeout(timer);
    }
  }

  private map(a: NominatimAddress): ResolvedAddress {
    // suburb TR verisinde çoğu zaman ilçedir → mahalle için kullanma.
    const neighbourhood = a.neighbourhood ?? a.quarter ?? a.residential ?? '';
    const road = a.road ?? '';
    const houseNumber = a.house_number ?? '';

    // Türkiye: genelde province = il. Yoksa city'yi il kabul et.
    const city = a.province ?? a.city ?? a.state ?? '';

    // İlçe adayları; "Mahallesi" içeren ya da mahalle adının aynısı olanlar elenir
    // (Nominatim TR verisinde city_district bazen mahalleyi tekrar eder).
    const looksLikeNeighbourhood = (v?: string): boolean =>
      !v ||
      /mahalle/i.test(v) ||
      v === neighbourhood ||
      v === `${neighbourhood} Mahallesi`;
    const district =
      [
        a.town,
        a.county,
        a.district,
        a.city_district,
        a.municipality,
        a.suburb,
      ].find((v) => !looksLikeNeighbourhood(v)) ?? '';

    const fullAddress = [
      neighbourhood && `${neighbourhood} Mah.`,
      road,
      houseNumber && `No ${houseNumber}`,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    const found = Boolean(city || district || neighbourhood || road);

    return {
      found,
      full_address: fullAddress,
      city,
      district,
      neighbourhood,
      road,
      house_number: houseNumber,
    };
  }
}
