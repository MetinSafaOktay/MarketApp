'use client';

import { useQuery } from '@tanstack/react-query';
import { clientApi } from './client-api';
import type { StoreProfile } from './types';

/** Storefront mağaza profili (herkese açık). Konum seçicideki teslimat dairesi için de kullanılır. */
export function useStore() {
  return useQuery({
    queryKey: ['store'],
    queryFn: () => clientApi<StoreProfile>('/store'),
    staleTime: 5 * 60 * 1000,
  });
}

export interface DeliveryArea {
  lat: number;
  lng: number;
  radiusKm: number;
}

/** Mağazanın teslimat bölgesi (üç alan da doluysa), yoksa null. */
export function deliveryAreaOf(store?: StoreProfile | null): DeliveryArea | null {
  if (
    !store ||
    store.latitude == null ||
    store.longitude == null ||
    store.delivery_radius_km == null ||
    store.delivery_radius_km <= 0
  ) {
    return null;
  }
  return {
    lat: store.latitude,
    lng: store.longitude,
    radiusKm: store.delivery_radius_km,
  };
}
