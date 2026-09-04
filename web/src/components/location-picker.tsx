'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LocateFixed } from 'lucide-react';
import { circlePolygon, haversineKm } from '@/lib/geo';
import { reverseGeocode, type ResolvedAddress } from '@/lib/geo-api';
import type { DeliveryArea } from '@/lib/use-store';

// Ücretsiz, anahtarsız vektör tile stili.
const STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';
// Konum bilinmiyorsa harita buraya ortalanır (Afyonkarahisar merkez).
const FALLBACK: [number, number] = [30.5433, 38.7507];

export type LatLng = { lat: number; lng: number };

export default function LocationPicker({
  value,
  onChange,
  onResolved,
  area,
}: {
  value: LatLng | null;
  onChange: (v: LatLng) => void;
  onResolved?: (r: ResolvedAddress) => void;
  area: DeliveryArea | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [center, setCenter] = useState<LatLng | null>(value);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // moveend closure `[]` deps ile kurulduğu için callback'ler ref üzerinden okunur.
  const onChangeRef = useRef(onChange);
  const onResolvedRef = useRef(onResolved);
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    onChangeRef.current = onChange;
    onResolvedRef.current = onResolved;
  });

  // Harita bir kez kurulur.
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const start: [number, number] = value
      ? [value.lng, value.lat]
      : area
        ? [area.lng, area.lat]
        : FALLBACK;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: start,
      zoom: area ? 12 : 13,
      attributionControl: { compact: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

    map.on('load', () => {
      if (area) {
        map.addSource('delivery-area', {
          type: 'geojson',
          data: circlePolygon(area.lng, area.lat, area.radiusKm),
        });
        map.addLayer({
          id: 'delivery-area-fill',
          type: 'fill',
          source: 'delivery-area',
          paint: { 'fill-color': '#ef8b86', 'fill-opacity': 0.12 },
        });
        map.addLayer({
          id: 'delivery-area-line',
          type: 'line',
          source: 'delivery-area',
          paint: { 'line-color': '#e23744', 'line-width': 1.5, 'line-dasharray': [2, 2] },
        });
        map.fitBounds(
          [
            [area.lng - area.radiusKm / 80, area.lat - area.radiusKm / 111],
            [area.lng + area.radiusKm / 80, area.lat + area.radiusKm / 111],
          ],
          { padding: 24, duration: 0 },
        );
      }
      setCenter({ lat: map.getCenter().lat, lng: map.getCenter().lng });
    });

    const emit = () => {
      const c = map.getCenter();
      const next = { lat: c.lat, lng: c.lng };
      setCenter(next);
      onChangeRef.current(next);

      // Pin durunca ~800 ms sonra ters geocode → formu ön-doldur.
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      geocodeTimer.current = setTimeout(() => {
        reverseGeocode(next.lat, next.lng)
          .then((r) => {
            if (r.found) onResolvedRef.current?.(r);
          })
          .catch(() => {});
      }, 800);
    };
    map.on('moveend', emit);

    // Kapsayıcı animasyonla açılıyorsa (form içinde) ilk ölçüm 0 olabilir.
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      map.remove();
      mapRef.current = null;
    };
    // value/area yalnızca ilk kurulumda okunur; sonrası kullanıcı etkileşimi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Tarayıcı konum servisini desteklemiyor.');
      return;
    }
    setLocating(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 15,
        });
      },
      () => {
        setLocating(false);
        setGeoError('Konum alınamadı. Tarayıcı iznini kontrol edin.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const distanceKm =
    center && area ? haversineKm(area.lat, area.lng, center.lat, center.lng) : null;
  const outside = distanceKm != null && area != null && distanceKm > area.radiusKm;

  return (
    <div className="space-y-2">
      <div className="relative h-64 w-full overflow-hidden rounded-lg border border-border">
        <div ref={containerRef} className="h-full w-full" />
        {/* Sabit merkez pini */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full text-danger">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
        </div>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="absolute left-2 top-2 flex items-center gap-1.5 rounded-lg border border-border bg-surface/90 px-2.5 py-1.5 text-xs font-medium shadow-sm hover:bg-surface disabled:opacity-60"
        >
          <LocateFixed className="size-3.5" />
          {locating ? 'Alınıyor…' : 'Konumumu kullan'}
        </button>
      </div>

      <p className="text-xs text-text-muted">
        Haritayı kaydırarak pini tam konumunuza getirin.
        {distanceKm != null && ` Mağazaya ~${distanceKm.toFixed(1)} km.`}
      </p>
      {geoError && <p className="text-xs text-danger">{geoError}</p>}
      {outside && area && (
        <p className="text-xs text-danger">
          Bu konum teslimat bölgesinin dışında (en fazla {area.radiusKm} km).
        </p>
      )}
    </div>
  );
}
