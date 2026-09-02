'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Pencil, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAdminProducts, useProductMutations } from '@/lib/use-admin';
import { formatPrice } from '@/lib/format';

export function ProductsTable() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data, isLoading } = useAdminProducts();
  const { remove } = useProductMutations();

  if (isLoading) return <p className="text-sm text-text-muted">{tc('loading')}</p>;

  const products = data?.data ?? [];
  if (products.length === 0) {
    return <p className="text-sm text-text-muted">{tc('empty')}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-card border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('name')}</th>
            <th className="px-3 py-2 font-medium">{t('sku')}</th>
            <th className="px-3 py-2 font-medium">{t('price')}</th>
            <th className="px-3 py-2 font-medium">{t('stock')}</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t border-border">
              <td className="px-3 py-2" dir="auto">
                {p.name.tr ?? p.name.en ?? '—'}
              </td>
              <td className="px-3 py-2 text-text-muted">{p.sku}</td>
              <td className="px-3 py-2">{formatPrice(p.price, locale)}</td>
              <td className="px-3 py-2">
                <span className={p.stock_quantity <= 0 ? 'text-danger' : undefined}>
                  {p.stock_quantity}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="flex justify-end gap-1">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                  >
                    <Pencil className="size-4" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t('confirmDelete'))) remove.mutate(p.id);
                    }}
                    className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
