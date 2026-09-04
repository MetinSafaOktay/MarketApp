/**
 * Teslimat bölgesi (kuş uçuşu yarıçap) kontrolü — adres oluşturma yolu.
 * Prisma + StoreService mock'lanır.
 */
import { UnprocessableEntityException } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { StoreService } from '../store/store.service';
import { haversineKm } from '../../common/geo';

type MockPrisma = {
  addresses: { create: jest.Mock };
};

// Gerçek haversine ile davranan sahte StoreService
function storeServiceWithArea(
  area: { latitude: number; longitude: number; radiusKm: number } | null,
): StoreService {
  return {
    checkAddressInArea(lat?: number | null, lng?: number | null) {
      if (!area || lat == null || lng == null)
        return Promise.resolve({ ok: true });
      const distanceKm = haversineKm(area.latitude, area.longitude, lat, lng);
      return Promise.resolve({
        ok: distanceKm <= area.radiusKm,
        radiusKm: area.radiusKm,
        distanceKm,
      });
    },
  } as unknown as StoreService;
}

describe('AddressesService.create — teslimat bölgesi', () => {
  let prisma: MockPrisma;

  const dto = {
    label: 'Ev',
    full_address: 'Erenler Mah. 1. Sk. No:1',
    city: 'Afyonkarahisar',
    district: 'Merkez',
    building_name: 'Erenler Apartmanı',
    building_no: '1',
    floor: '2',
    apartment_no: '4',
  };
  const STORE = { latitude: 38.7569, longitude: 30.5387, radiusKm: 5 };

  beforeEach(() => {
    prisma = {
      addresses: { create: jest.fn().mockResolvedValue({ id: 'a1' }) },
    };
  });

  it('bölge tanımsızsa koordinatlı adres bile kabul edilir', async () => {
    const service = new AddressesService(
      prisma as never,
      storeServiceWithArea(null),
    );
    await service.create('u1', { ...dto, latitude: 0, longitude: 0 });
    expect(prisma.addresses.create).toHaveBeenCalled();
  });

  it('koordinat yoksa serbest geçer', async () => {
    const service = new AddressesService(
      prisma as never,
      storeServiceWithArea(STORE),
    );
    await service.create('u1', dto);
    expect(prisma.addresses.create).toHaveBeenCalled();
  });

  it('bölge içindeki koordinat kabul edilir', async () => {
    const service = new AddressesService(
      prisma as never,
      storeServiceWithArea(STORE),
    );
    await service.create('u1', {
      ...dto,
      latitude: 38.7569 + 0.02, // ~2.2 km kuzey
      longitude: 30.5387,
    });
    expect(prisma.addresses.create).toHaveBeenCalled();
  });

  it('bölge dışındaki koordinat 422 ile reddedilir', async () => {
    const service = new AddressesService(
      prisma as never,
      storeServiceWithArea(STORE),
    );
    await expect(
      service.create('u1', {
        ...dto,
        latitude: 38.7569 + 0.1, // ~11 km kuzey
        longitude: 30.5387,
      }),
    ).rejects.toThrow(UnprocessableEntityException);
    expect(prisma.addresses.create).not.toHaveBeenCalled();
  });
});
