/** GeoService ters geocoding — Nominatim yanıt eşlemesi + hata/cache davranışı. */
import { GeoService } from './geo.service';

describe('GeoService.reverse', () => {
  let service: GeoService;
  const originalFetch = global.fetch;

  beforeEach(() => {
    service = new GeoService();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockNominatim(address: Record<string, string>) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ address }),
    }) as never;
  }

  it('maps a Turkish address (province = il, county = ilçe)', async () => {
    mockNominatim({
      road: 'Atatürk Caddesi',
      house_number: '5',
      neighbourhood: 'Erenler',
      county: 'Merkez',
      province: 'Afyonkarahisar',
    });

    const r = await service.reverse(38.7569, 30.5387);
    expect(r.found).toBe(true);
    expect(r.city).toBe('Afyonkarahisar');
    expect(r.district).toBe('Merkez');
    expect(r.neighbourhood).toBe('Erenler');
    expect(r.full_address).toBe('Erenler Mah. Atatürk Caddesi No 5');
  });

  it('falls back to city when province is missing; suburb becomes the district', async () => {
    mockNominatim({ city: 'İstanbul', suburb: 'Kadıköy', road: 'Bağdat Cd.' });
    const r = await service.reverse(40.9, 29.0);
    expect(r.city).toBe('İstanbul');
    expect(r.district).toBe('Kadıköy');
  });

  it('does not treat a "... Mahallesi" city_district as the district', async () => {
    mockNominatim({
      province: 'Afyonkarahisar',
      neighbourhood: 'Güvenevler',
      city_district: 'Güvenevler Mahallesi',
    });
    const r = await service.reverse(38.75, 30.55);
    expect(r.neighbourhood).toBe('Güvenevler');
    expect(r.district).toBe('');
  });

  it('returns not-found on a network error without throwing', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as never;
    const r = await service.reverse(0, 0);
    expect(r.found).toBe(false);
    expect(r.full_address).toBe('');
  });

  it('serves the second call from cache (one fetch)', async () => {
    mockNominatim({ province: 'Afyonkarahisar', county: 'Merkez' });
    await service.reverse(38.75691, 30.53871);
    await service.reverse(38.75694, 30.53872); // aynı ~11 m hücre
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
