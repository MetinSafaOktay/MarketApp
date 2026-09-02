'use client';

import { use, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useAdminOrders, useUpdateOrderStatus } from '@/lib/use-admin';
import { useOrder } from '@/lib/use-orders';
import { formatPrice } from '@/lib/format';
import { OrderStatusBadge } from '@/components/orders/order-status-badge';
import type { OrderStatus } from '@/lib/types';

const STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export function AdminOrdersTable() {
  const t = useTranslations('Orders');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: orders, isLoading } = useAdminOrders();

  if (isLoading) return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  if (!orders || orders.length === 0)
    return <p className="text-sm text-text-muted">{t('empty')}</p>;

  return (
    <div className="space-y-2">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/admin/orders/${o.id}`}
          className="flex items-center gap-3 rounded-card border border-border bg-surface p-3 text-sm hover:bg-surface-2"
        >
          <span className="font-medium">#{o.id.slice(0, 8)}</span>
          <OrderStatusBadge status={o.status} />
          <span className="text-text-muted">
            {new Date(o.created_at).toLocaleDateString(locale)}
          </span>
          <span className="ml-auto font-semibold">
            {formatPrice(o.total_amount, locale)}
          </span>
          <ChevronRight className="size-4 text-text-muted" />
        </Link>
      ))}
    </div>
  );
}

export function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('Orders');
  const ta = useTranslations('Admin');
  const tco = useTranslations('Checkout');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: order, isLoading } = useOrder(id);
  const updateStatus = useUpdateOrderStatus();
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [note, setNote] = useState('');

  if (isLoading) return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  if (!order) return <p className="text-sm text-danger">{tc('error')}</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold">#{order.id.slice(0, 8)}</h1>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Durum güncelle */}
      <div className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-2 text-sm font-semibold">{ta('updateStatus')}</h2>
        <div className="flex flex-wrap items-end gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          >
            <option value="">{ta('orderStatus')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`status_${s}`)}
              </option>
            ))}
          </select>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={ta('statusNote')}
            className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
          />
          <button
            type="button"
            disabled={!status || updateStatus.isPending}
            onClick={() => {
              if (status)
                updateStatus.mutate(
                  { id: order.id, status, note: note || undefined },
                  { onSuccess: () => { setStatus(''); setNote(''); } },
                );
            }}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50"
          >
            {ta('save')}
          </button>
        </div>
      </div>

      {/* Takip */}
      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('timeline')}</h2>
        <ol className="space-y-2 text-sm">
          {order.order_status_history.map((h) => (
            <li key={h.id} className="flex gap-2">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
              <span>
                {t(`status_${h.status}`)}
                {h.note && <span className="text-text-muted"> · {h.note}</span>}
                <span className="block text-xs text-text-muted">
                  {new Date(h.created_at).toLocaleString(locale)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Ürünler + adres */}
      <section className="rounded-card border border-border bg-surface p-4 text-sm">
        <h2 className="mb-2 font-semibold">{t('items')}</h2>
        {order.order_items.map((it) => (
          <div key={it.id} className="flex justify-between">
            <span dir="auto">
              {it.products.name} × {it.quantity}
            </span>
            <span>{formatPrice(it.subtotal, locale)}</span>
          </div>
        ))}
        <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
          <span>{tco('total')}</span>
          <span>{formatPrice(order.total_amount, locale)}</span>
        </div>
        <p className="mt-3 text-text-muted" dir="auto">
          {order.addresses.full_address}, {order.addresses.district}/
          {order.addresses.city} ·{' '}
          {order.payment_method === 'card' ? tco('card') : tco('cash')}
        </p>
      </section>
    </div>
  );
}
