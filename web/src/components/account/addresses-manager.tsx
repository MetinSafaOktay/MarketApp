'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Star, Trash2 } from 'lucide-react';
import {
  useAddresses,
  useAddressMutations,
  type AddressInput,
} from '@/lib/use-addresses';
import type { Address } from '@/lib/types';

export function AddressesManager() {
  const t = useTranslations('Addresses');
  const tc = useTranslations('Common');
  const { data: addresses, isLoading } = useAddresses();
  const { remove } = useAddressMutations();
  const [editing, setEditing] = useState<Address | 'new' | null>(null);

  return (
    <div className="space-y-4">
      {editing ? (
        <AddressFormRow
          address={editing === 'new' ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('add')}
        </button>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">{tc('loading')}</p>
      ) : !addresses || addresses.length === 0 ? (
        <p className="text-sm text-text-muted">{t('empty')}</p>
      ) : (
        <div className="space-y-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-card border border-border bg-surface p-3 text-sm"
            >
              <div className="flex-1">
                <span className="flex items-center gap-1.5 font-medium" dir="auto">
                  {a.label}
                  {a.is_default && <Star className="size-3.5 fill-accent text-accent" />}
                </span>
                <span className="block text-text-muted" dir="auto">
                  {a.full_address}, {a.district}/{a.city}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditing(a)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => confirm(t('confirmDelete')) && remove.mutate(a.id)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddressFormRow({
  address,
  onDone,
}: {
  address?: Address;
  onDone: () => void;
}) {
  const t = useTranslations('Addresses');
  const { create, update } = useAddressMutations();
  const [form, setForm] = useState<AddressInput>({
    label: address?.label ?? '',
    full_address: address?.full_address ?? '',
    city: address?.city ?? '',
    district: address?.district ?? '',
    is_default: address?.is_default ?? false,
  });
  const [error, setError] = useState<string | null>(null);

  function field(key: keyof AddressInput) {
    return {
      value: form[key] as string,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((f) => ({ ...f, [key]: e.target.value })),
    };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (address) await update.mutateAsync({ id: address.id, input: form });
      else await create.mutateAsync(form);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-card border border-border bg-surface p-4 text-sm"
    >
      <input placeholder={t('label')} required {...field('label')} className={inputCls} />
      <input placeholder={t('fullAddress')} required {...field('full_address')} className={inputCls} />
      <div className="grid grid-cols-2 gap-3">
        <input placeholder={t('city')} required {...field('city')} className={inputCls} />
        <input placeholder={t('district')} required {...field('district')} className={inputCls} />
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!form.is_default}
          onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
          className="accent-[var(--color-accent)]"
        />
        {t('isDefault')}
      </label>
      {error && <p className="text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 hover:bg-surface-2"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

const inputCls =
  'w-full rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40';
