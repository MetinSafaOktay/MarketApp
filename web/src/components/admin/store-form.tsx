'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useAdminStore, useUpdateStore } from '@/lib/use-admin';
import type { TranslatedText } from '@/lib/admin-types';
import { TranslationInput } from './translation-input';
import { ImageUpload } from './image-upload';

export function StoreForm() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const { data: store, isLoading } = useAdminStore();
  const update = useUpdateStore();

  if (isLoading || !store) {
    return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  }

  return <StoreFormInner key={store.id} store={store} update={update} t={t} />;
}

function StoreFormInner({
  store,
  update,
  t,
}: {
  store: NonNullable<ReturnType<typeof useAdminStore>['data']>;
  update: ReturnType<typeof useUpdateStore>;
  t: ReturnType<typeof useTranslations>;
}) {
  const [name, setName] = useState(store.name ?? '');
  const [city, setCity] = useState(store.city ?? '');
  const [phone, setPhone] = useState(store.phone ?? '');
  const [address, setAddress] = useState(store.address ?? '');
  const [logoUrl, setLogoUrl] = useState(store.logo_url ?? '');
  const [coverUrl, setCoverUrl] = useState(store.cover_image_url ?? '');
  const [tagline, setTagline] = useState<TranslatedText>(store.tagline ?? {});
  const [description, setDescription] = useState<TranslatedText>(
    store.description ?? {},
  );
  const [hours, setHours] = useState<HourRow[]>(() =>
    toHourRows(store.working_hours),
  );
  const [lat, setLat] = useState(numStr(store.latitude));
  const [lng, setLng] = useState(numStr(store.longitude));
  const [radius, setRadius] = useState(numStr(store.delivery_radius_km));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    try {
      await update.mutateAsync({
        name,
        city: city || undefined,
        phone: phone || undefined,
        address: address || undefined,
        logo_url: logoUrl || undefined,
        cover_image_url: coverUrl || undefined,
        tagline: Object.keys(tagline).length ? tagline : undefined,
        description: Object.keys(description).length ? description : undefined,
        working_hours: fromHourRows(hours),
        latitude: parseNum(lat),
        longitude: parseNum(lng),
        delivery_radius_km: parseNum(radius),
      });
      setSaved(true);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <Field label={t('name')} value={name} onChange={setName} />
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('city')} value={city} onChange={setCity} />
        <Field label={t('phone')} value={phone} onChange={setPhone} />
      </div>
      <Field label={t('address')} value={address} onChange={setAddress} />

      <div className="grid gap-4 sm:grid-cols-2">
        <ImagePicker label="Logo" value={logoUrl} onChange={setLogoUrl} deleteLabel={t('delete')} />
        <ImagePicker label="Kapak" value={coverUrl} onChange={setCoverUrl} deleteLabel={t('delete')} />
      </div>
      <TranslationInput label={t('tagline')} value={tagline} onChange={setTagline} />
      <TranslationInput
        label={t('description')}
        value={description}
        onChange={setDescription}
        textarea
      />
      <WorkingHoursEditor rows={hours} onChange={setHours} deleteLabel={t('delete')} />

      <div className="flex flex-col gap-2 text-sm">
        <span className="text-text-muted">Teslimat Bölgesi</span>
        <p className="text-xs text-text-muted">
          Mağaza konumu ve yarıçapı. Üçü de dolduğunda, bu yarıçapın (kuş uçuşu)
          dışındaki adreslerden sipariş alınmaz. Boş bırakılırsa sınır uygulanmaz.
          Konum için Google Maps&apos;te mağazaya sağ tıklayıp koordinatları kopyalayın.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Enlem" value={lat} onChange={setLat} placeholder="38.7569" />
          <Field label="Boylam" value={lng} onChange={setLng} placeholder="30.5387" />
          <Field label="Yarıçap (km)" value={radius} onChange={setRadius} placeholder="5" />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
      {saved && <p className="text-sm text-success">{t('updated')}</p>}
      <button
        type="submit"
        disabled={update.isPending}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
      >
        {t('save')}
      </button>
    </form>
  );
}

/* ---------- Çalışma saatleri ---------- */

type HourRow = { day: string; value: string };

// Varsayılan gün satırları (mağaza ilk kez saat girerken hazır şablon).
const DEFAULT_DAYS = [
  'Pazartesi - Cuma',
  'Cumartesi',
  'Pazar',
];

function toHourRows(wh: Record<string, unknown> | null | undefined): HourRow[] {
  const entries = wh ? Object.entries(wh) : [];
  if (entries.length === 0) return DEFAULT_DAYS.map((day) => ({ day, value: '' }));
  return entries.map(([day, value]) => ({ day, value: String(value ?? '') }));
}

// Boş satırları at, sırayı koru. Hiç dolu satır yoksa {} → alanı temizler.
function fromHourRows(rows: HourRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const { day, value } of rows) {
    const d = day.trim();
    const v = value.trim();
    if (d && v) out[d] = v;
  }
  return out;
}

function WorkingHoursEditor({
  rows,
  onChange,
  deleteLabel,
}: {
  rows: HourRow[];
  onChange: (rows: HourRow[]) => void;
  deleteLabel: string;
}) {
  function set(i: number, patch: Partial<HourRow>) {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="text-text-muted">Çalışma Saatleri</span>
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={row.day}
            onChange={(e) => set(i, { day: e.target.value })}
            placeholder="Gün(ler)"
            className="w-40 rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
          />
          <input
            value={row.value}
            onChange={(e) => set(i, { value: e.target.value })}
            placeholder="08:00 – 22:00"
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="button"
            onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
            className="text-xs text-text-muted hover:text-danger"
          >
            {deleteLabel}
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...rows, { day: '', value: '' }])}
        className="self-start text-xs font-semibold text-accent hover:underline"
      >
        + Satır ekle
      </button>
    </div>
  );
}

function ImagePicker({
  label,
  value,
  onChange,
  deleteLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  deleteLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <div className="flex items-center gap-3">
        {value && (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
            <Image src={value} alt="" fill sizes="64px" className="object-cover" />
          </div>
        )}
        <ImageUpload onUploaded={onChange} />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-text-muted hover:text-danger"
          >
            {deleteLabel}
          </button>
        )}
      </div>
    </div>
  );
}

/** Sayı alanı: boş string → null (temizler), aksi hâlde Number. */
function parseNum(s: string): number | null {
  return s.trim() === '' ? null : Number(s);
}

/** null/undefined → '' (kontrollü input için). */
function numStr(n: number | null | undefined): string {
  return n == null ? '' : String(n);
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
