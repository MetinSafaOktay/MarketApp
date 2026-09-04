'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAddAddress } from '@/lib/use-addresses';
import { useStore, deliveryAreaOf } from '@/lib/use-store';
import { haversineKm } from '@/lib/geo';
import { LocationPicker, type LatLng } from '../location-picker-lazy';

export function AddressForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations('Checkout');
  const add = useAddAddress();
  const { data: store } = useStore();
  const area = deliveryAreaOf(store);
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);

  const outside =
    coords && area
      ? haversineKm(area.lat, area.lng, coords.lat, coords.lng) > area.radiusKm
      : false;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!coords) {
      setError('Lütfen haritadan konum seçin.');
      return;
    }
    const f = new FormData(e.currentTarget);
    try {
      await add.mutateAsync({
        label: String(f.get('label')),
        full_address: String(f.get('full_address')),
        city: String(f.get('city')),
        district: String(f.get('district')),
        latitude: coords.lat,
        longitude: coords.lng,
      });
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-3 space-y-3 rounded-lg border border-border bg-surface-2 p-3"
    >
      <Input name="label" placeholder={t('addressLabel')} />
      <Input name="full_address" placeholder={t('fullAddress')} />
      <div className="grid grid-cols-2 gap-3">
        <Input name="city" placeholder={t('city')} />
        <Input name="district" placeholder={t('district')} />
      </div>

      <LocationPicker value={coords} onChange={setCoords} area={area} />

      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={add.isPending || !coords || outside}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

function Input({ name, placeholder }: { name: string; placeholder: string }) {
  return (
    <input
      name={name}
      placeholder={placeholder}
      required
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
    />
  );
}
