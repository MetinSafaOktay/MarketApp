'use client';

import dynamic from 'next/dynamic';

// maplibre-gl `window`'a erişir → yalnızca istemcide yüklenir.
export const LocationPicker = dynamic(() => import('./location-picker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full animate-pulse rounded-lg border border-border bg-surface-2" />
  ),
});

export type { LatLng } from './location-picker';
