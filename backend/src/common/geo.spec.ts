import { haversineKm } from './geo';

describe('haversineKm', () => {
  it('aynı nokta için 0', () => {
    expect(haversineKm(38.7569, 30.5387, 38.7569, 30.5387)).toBe(0);
  });

  it('1° enlem farkı ≈ 111 km', () => {
    const d = haversineKm(38, 30, 39, 30);
    expect(d).toBeGreaterThan(110);
    expect(d).toBeLessThan(112);
  });

  it('Afyonkarahisar merkezinden ~5 km kuzey ≈ 5 km', () => {
    // ~0.045° enlem ≈ 5 km
    const d = haversineKm(38.7569, 30.5387, 38.7569 + 0.045, 30.5387);
    expect(d).toBeGreaterThan(4.8);
    expect(d).toBeLessThan(5.2);
  });

  it('simetrik (a→b == b→a)', () => {
    const a = haversineKm(41.0, 29.0, 39.9, 32.85);
    const b = haversineKm(39.9, 32.85, 41.0, 29.0);
    expect(a).toBeCloseTo(b, 6);
  });
});
