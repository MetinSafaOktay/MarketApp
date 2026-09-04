'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAddAddress } from '@/lib/use-addresses';
import { useStore, deliveryAreaOf } from '@/lib/use-store';
import { haversineKm } from '@/lib/geo';
import type { ResolvedAddress } from '@/lib/geo-api';
import { LocationPicker, type LatLng } from '../location-picker-lazy';

type FieldKey =
  | 'label'
  | 'full_address'
  | 'city'
  | 'district'
  | 'building_name'
  | 'building_no'
  | 'floor'
  | 'apartment_no';

export function AddressForm({ onDone }: { onDone: () => void }) {
  const t = useTranslations('Checkout');
  const add = useAddAddress();
  const { data: store } = useStore();
  const area = deliveryAreaOf(store);

  const [fields, setFields] = useState<Record<FieldKey, string>>({
    label: '',
    full_address: '',
    city: '',
    district: '',
    building_name: '',
    building_no: '',
    floor: '',
    apartment_no: '',
  });
  const [touched, setTouched] = useState<Set<FieldKey>>(new Set());
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [autofilled, setAutofilled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(key: FieldKey, value: string) {
    setFields((f) => ({ ...f, [key]: value }));
    setTouched((s) => new Set(s).add(key));
  }

  // Haritadan çözülen adres — kullanıcının elle değiştirmediği alanları doldur.
  function applyResolved(r: ResolvedAddress) {
    setFields((f) => ({
      ...f,
      full_address: touched.has('full_address') || !r.full_address ? f.full_address : r.full_address,
      city: touched.has('city') || !r.city ? f.city : r.city,
      district: touched.has('district') || !r.district ? f.district : r.district,
    }));
    if (r.full_address || r.city || r.district) setAutofilled(true);
  }

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
    const building = {
      building_name: fields.building_name.trim(),
      building_no: fields.building_no.trim(),
      floor: fields.floor.trim(),
      apartment_no: fields.apartment_no.trim(),
    };
    if (!building.building_name || !building.building_no || !building.floor || !building.apartment_no) {
      setError(t('buildingFieldsRequired'));
      return;
    }
    try {
      await add.mutateAsync({
        label: fields.label.trim(),
        full_address: fields.full_address.trim(),
        city: fields.city.trim(),
        district: fields.district.trim(),
        ...building,
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
      <Input
        placeholder={t('addressLabel')}
        value={fields.label}
        onChange={(v) => set('label', v)}
      />

      <LocationPicker
        value={coords}
        onChange={setCoords}
        onResolved={applyResolved}
        area={area}
      />
      {autofilled && (
        <p className="text-xs text-text-muted">
          Adres alanları haritadan dolduruldu — gerekirse düzeltin.
        </p>
      )}

      <Input
        placeholder={t('fullAddress')}
        value={fields.full_address}
        onChange={(v) => set('full_address', v)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder={t('city')} value={fields.city} onChange={(v) => set('city', v)} />
        <Input
          placeholder={t('district')}
          value={fields.district}
          onChange={(v) => set('district', v)}
        />
      </div>

      <Input
        placeholder={t('buildingName')}
        value={fields.building_name}
        onChange={(v) => set('building_name', v)}
      />
      <div className="grid grid-cols-3 gap-3">
        <Input
          placeholder={t('buildingNo')}
          value={fields.building_no}
          onChange={(v) => set('building_no', v)}
        />
        <Input placeholder={t('floor')} value={fields.floor} onChange={(v) => set('floor', v)} />
        <Input
          placeholder={t('apartmentNo')}
          value={fields.apartment_no}
          onChange={(v) => set('apartment_no', v)}
        />
      </div>

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

function Input({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
    />
  );
}
