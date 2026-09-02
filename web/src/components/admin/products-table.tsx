'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Eye, EyeOff, Pencil, Search, Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAdminProducts, useProductMutations } from '@/lib/use-admin';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';

export function ProductsTable() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const { data, isLoading, isPlaceholderData } = useAdminProducts(page, q);
  const { remove, update } = useProductMutations();

  const products = data?.data ?? [];
  const meta = data?.meta;

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder={tc('search')}
          className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-text-muted">{tc('loading')}</p>
      ) : products.length === 0 ? (
        <p className="text-sm text-text-muted">{tc('empty')}</p>
      ) : (
        <div
          className={cn(
            'overflow-x-auto rounded-card border border-border',
            isPlaceholderData && 'opacity-60',
          )}
        >
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
                <tr
                  key={p.id}
                  className={cn(
                    'border-t border-border',
                    !p.is_active && 'opacity-50',
                  )}
                >
                  <td className="px-3 py-2" dir="auto">
                    {p.name.tr ?? p.name.en ?? '—'}
                  </td>
                  <td className="px-3 py-2 text-text-muted">{p.sku}</td>
                  <td className="px-3 py-2">{formatPrice(p.price, locale)}</td>
                  <td className="px-3 py-2">
                    <span
                      className={
                        p.stock_quantity <= 0 ? 'text-danger' : undefined
                      }
                    >
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        title={p.is_active ? 'Aktif' : 'Pasif'}
                        onClick={() =>
                          update.mutate({
                            id: p.id,
                            body: { is_active: !p.is_active },
                          })
                        }
                        className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                      >
                        {p.is_active ? (
                          <Eye className="size-4" />
                        ) : (
                          <EyeOff className="size-4" />
                        )}
                      </button>
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
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">
            {meta.page} / {meta.totalPages} · {meta.total}
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              type="button"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-border px-3 py-1.5 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
