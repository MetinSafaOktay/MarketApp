'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminStore, useUpdateStore } from '@/lib/use-admin';
import type { TranslatedText } from '@/lib/admin-types';
import { TranslationInput } from './translation-input';

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
      <div className="grid grid-cols-2 gap-3">
        <Field label="logo_url" value={logoUrl} onChange={setLogoUrl} />
        <Field label="cover_image_url" value={coverUrl} onChange={setCoverUrl} />
      </div>
      <TranslationInput label={t('tagline')} value={tagline} onChange={setTagline} />
      <TranslationInput
        label={t('description')}
        value={description}
        onChange={setDescription}
        textarea
      />
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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
