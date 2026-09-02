'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2 } from 'lucide-react';
import {
  useAdminCategories,
  useCategoryMutations,
} from '@/lib/use-admin';
import type { AdminCategory, TranslatedText } from '@/lib/admin-types';
import { TranslationInput } from './translation-input';
import { ImageUpload } from './image-upload';
import Image from 'next/image';

export function CategoriesManager() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const { data: categories, isLoading } = useAdminCategories();
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);
  const { remove } = useCategoryMutations();

  return (
    <div className="space-y-4">
      {editing ? (
        <CategoryForm
          category={editing === 'new' ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('new')}
        </button>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">{tc('loading')}</p>
      ) : (
        <div className="divide-y divide-border rounded-card border border-border">
          {(categories ?? []).map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="flex-1" dir="auto">
                {c.name.tr ?? c.name.en ?? '—'}
              </span>
              <span className="text-xs text-text-muted">#{c.display_order}</span>
              <button
                type="button"
                onClick={() => setEditing(c)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(t('confirmDelete'))) remove.mutate(c.id);
                }}
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

function CategoryForm({
  category,
  onDone,
}: {
  category?: AdminCategory;
  onDone: () => void;
}) {
  const t = useTranslations('Admin');
  const { create, update } = useCategoryMutations();
  const [name, setName] = useState<TranslatedText>(category?.name ?? {});
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? '');
  const [order, setOrder] = useState(String(category?.display_order ?? 0));
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.tr?.trim()) {
      setError('TR *');
      return;
    }
    const body = {
      name,
      image_url: imageUrl || undefined,
      display_order: Number(order),
    };
    try {
      if (category) await update.mutateAsync({ id: category.id, body });
      else await create.mutateAsync(body);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-card border border-border bg-surface p-4"
    >
      <TranslationInput label={t('name')} value={name} onChange={setName} required />

      <div className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-muted">{t('images')}</span>
        <div className="flex items-center gap-3">
          {imageUrl && (
            <div className="relative size-16 overflow-hidden rounded-lg border border-border bg-white">
              <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" />
            </div>
          )}
          <ImageUpload onUploaded={setImageUrl} />
          {imageUrl && (
            <button
              type="button"
              onClick={() => setImageUrl('')}
              className="text-xs text-text-muted hover:text-danger"
            >
              {t('delete')}
            </button>
          )}
        </div>
      </div>

      <label className="flex max-w-[8rem] flex-col gap-1.5 text-sm">
        <span className="text-text-muted">{t('displayOrder')}</span>
        <input
          type="number"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}
