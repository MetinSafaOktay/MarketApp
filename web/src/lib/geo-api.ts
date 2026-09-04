'use client';

import { clientApi } from './client-api';

/** `GET /geo/reverse` sonucu — koordinattan çözülen adres. */
export interface ResolvedAddress {
  found: boolean;
  full_address: string;
  city: string;
  district: string;
  neighbourhood: string;
  road: string;
  house_number: string;
}

export function reverseGeocode(
  lat: number,
  lng: number,
): Promise<ResolvedAddress> {
  return clientApi<ResolvedAddress>('/geo/reverse', {
    params: { lat: String(lat), lng: String(lng) },
  });
}
