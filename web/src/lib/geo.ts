/** Coğrafi yardımcılar — teslimat bölgesi ön kontrolü + harita dairesi. */

const EARTH_RADIUS_KM = 6371;
const toRad = (deg: number): number => (deg * Math.PI) / 180;
const toDeg = (rad: number): number => (rad * 180) / Math.PI;

/** İki koordinat arası kuş uçuşu mesafe (km). Backend'deki haversineKm ile aynı. */
export function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/**
 * Merkez + yarıçap (km) → GeoJSON Polygon (harita üzerinde teslimat dairesi).
 * `steps` kadar noktayla yaklaşık bir çember.
 */
export function circlePolygon(
  centerLng: number,
  centerLat: number,
  radiusKm: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const latR = toRad(centerLat);
  for (let i = 0; i <= steps; i++) {
    const bearing = toRad((i * 360) / steps);
    const angular = radiusKm / EARTH_RADIUS_KM;
    const lat2 = Math.asin(
      Math.sin(latR) * Math.cos(angular) +
        Math.cos(latR) * Math.sin(angular) * Math.cos(bearing),
    );
    const lng2 =
      toRad(centerLng) +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angular) * Math.cos(latR),
        Math.cos(angular) - Math.sin(latR) * Math.sin(lat2),
      );
    coords.push([toDeg(lng2), toDeg(lat2)]);
  }
  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}
