import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateStoreDto } from './dto/update-store.dto';
import { DEFAULT_LOCALE, Locale } from '../../common/i18n/locales';
import { localizeFields } from '../../common/i18n/localize';
import { haversineKm } from '../../common/geo';

const I18N_FIELDS = ['tagline', 'description'] as const; // çok dilli jsonb kolonlar

/** Tanımlıysa mağazanın teslimat bölgesi (kuş uçuşu). */
export interface DeliveryArea {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

/** Bir adresin bölge kontrolü sonucu. `ok=true` → kısıt yok veya bölge içinde. */
export interface DeliveryAreaCheck {
  ok: boolean;
  /** Kısıt aktifse: yarıçap ve mağazaya uzaklık (km). */
  radiusKm?: number;
  distanceKm?: number;
}

@Injectable()
export class StoreService {
  constructor(private readonly prisma: PrismaService) {}

  // store_profile tek satırdır; hiç yoksa bir kez seed'ler (ilk kurulum kolaylığı)
  private async getRaw() {
    const existing = await this.prisma.store_profile.findFirst();
    if (existing) return existing;
    return this.prisma.store_profile.create({
      data: { name: 'Erenler Market' },
    });
  }

  async get(locale: Locale = DEFAULT_LOCALE, raw = false) {
    const profile = await this.getRaw();
    // raw değilse tagline/description tek dile indirilir
    return raw ? profile : localizeFields(profile, locale, I18N_FIELDS);
  }

  async update(dto: UpdateStoreDto) {
    const existing = await this.getRaw();
    return this.prisma.store_profile.update({
      where: { id: existing.id },
      data: dto as Prisma.store_profileUpdateInput,
    });
  }

  /**
   * Teslimat bölgesi tanımlıysa döner, değilse null (kısıt yok).
   * Üç alandan biri bile boşsa veya yarıçap <= 0 ise kısıt kapalıdır.
   */
  async getDeliveryArea(): Promise<DeliveryArea | null> {
    const p = await this.getRaw();
    if (
      p.latitude == null ||
      p.longitude == null ||
      p.delivery_radius_km == null ||
      p.delivery_radius_km <= 0
    ) {
      return null;
    }
    return {
      latitude: p.latitude,
      longitude: p.longitude,
      radiusKm: p.delivery_radius_km,
    };
  }

  /**
   * Verilen koordinat teslimat bölgesinde mi?
   * Bölge tanımsızsa VEYA koordinat verilmemişse `ok: true` (kısıt uygulanmaz).
   */
  async checkAddressInArea(
    latitude?: number | null,
    longitude?: number | null,
  ): Promise<DeliveryAreaCheck> {
    const area = await this.getDeliveryArea();
    if (!area || latitude == null || longitude == null) return { ok: true };

    const distanceKm = haversineKm(
      area.latitude,
      area.longitude,
      latitude,
      longitude,
    );
    return {
      ok: distanceKm <= area.radiusKm,
      radiusKm: area.radiusKm,
      distanceKm,
    };
  }
}
