'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import {
  useAdminCategories,
  useProductMutations,
} from '@/lib/use-admin';
import type { AdminProduct, TranslatedText } from '@/lib/admin-types';
import { TranslationInput } from './translation-input';
import { ImageUpload } from './image-upload';

export function ProductForm({ product }: { product?: AdminProduct }) {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { data: categories } = useAdminCategories();
  const { create, update, addImage, removeImage } = useProductMutations();

  const editing = !!product;
  const [name, setName] = useState<TranslatedText>(product?.name ?? {});
  const [description, setDescription] = useState<TranslatedText>(
    product?.description ?? {},
  );
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [originalPrice, setOriginalPrice] = useState(
    product?.original_price ?? '',
  );
  const [stock, setStock] = useState(String(product?.stock_quantity ?? 0));
  const [isNew, setIsNew] = useState(product?.is_new_arrival ?? false);
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const images = product?.product_images ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.tr?.trim()) {
      setError('TR *');
      return;
    }
    const body = {
      category_id: categoryId,
      name,
      sku,
      description: Object.keys(description).length ? description : undefined,
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : undefined,
      is_new_arrival: isNew,
      stock_quantity: Number(stock),
    };

    try {
      if (editing) {
        await update.mutateAsync({ id: product.id, body });
      } else {
        const created = await create.mutateAsync({
          ...body,
          images: pendingImages,
        });
        router.replace(`/admin/products/${(created as AdminProduct).id}`);
        return;
      }
      router.push('/admin/products');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-lg space-y-4">
      <TranslationInput
        label={t('name')}
        value={name}
        onChange={setName}
        required
      />

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="text-text-muted">{t('category')} *</span>
        <select
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
        >
          <option value="">—</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name.tr ?? c.id}
            </option>
          ))}
        </select>
      </label>

      <Field label={`${t('sku')} *`} value={sku} onChange={setSku} required />

      <div className="grid grid-cols-2 gap-3">
        <Field
          label={`${t('price')} *`}
          value={price}
          onChange={setPrice}
          type="number"
          required
        />
        <Field
          label={t('originalPrice')}
          value={originalPrice}
          onChange={setOriginalPrice}
          type="number"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label={t('stock')}
          value={stock}
          onChange={setStock}
          type="number"
        />
        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          {t('isNewArrival')}
        </label>
      </div>

      <TranslationInput
        label={t('description')}
        value={description}
        onChange={setDescription}
        textarea
      />

      {/* Görseller */}
      <div className="space-y-2">
        <span className="text-sm text-text-muted">{t('images')}</span>
        <div className="flex flex-wrap gap-2">
          {editing &&
            images.map((img) => (
              <div key={img.id} className="relative size-20 overflow-hidden rounded-lg border border-border bg-white">
                <Image src={img.image_url} alt="" fill sizes="80px" className="object-contain" />
                <button
                  type="button"
                  onClick={() => removeImage.mutate({ id: product.id, imageId: img.id })}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          {!editing &&
            pendingImages.map((url, i) => (
              <div key={i} className="relative size-20 overflow-hidden rounded-lg border border-border bg-white">
                <Image src={url} alt="" fill sizes="80px" className="object-contain" />
                <button
                  type="button"
                  onClick={() => setPendingImages((p) => p.filter((u) => u !== url))}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
        </div>
        <ImageUpload
          onUploaded={(url) => {
            if (editing) addImage.mutate({ id: product.id, image_url: url });
            else setPendingImages((p) => [...p, url]);
          }}
        />
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={create.isPending || update.isPending}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-text-muted">{label}</span>
      <input
        type={type}
        step={type === 'number' ? 'any' : undefined}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
