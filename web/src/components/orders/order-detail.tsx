'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useOrder, useCancelOrder } from '@/lib/use-orders';
import { formatPrice, formatAddress } from '@/lib/format';
import { OrderStatusBadge } from './order-status-badge';

const CANCELLABLE = ['pending', 'confirmed'];

export function OrderDetail({ id }: { id: string }) {
  const t = useTranslations('Orders');
  const tco = useTranslations('Checkout');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: order, isLoading } = useOrder(id);
  const cancel = useCancelOrder(id);

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-text-muted">{tc('loading')}</p>;
  }
  if (!order) {
    return <p className="py-16 text-center text-text-muted">{tc('error')}</p>;
  }

  const discount = Number(order.discount_amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold">
            {t('orderNumber')} #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-text-muted">
            {new Date(order.created_at).toLocaleString(locale)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Takip */}
      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('timeline')}</h2>
        <ol className="space-y-3">
          {order.order_status_history.map((h) => (
            <li key={h.id} className="flex gap-3 text-sm">
              <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
              <span>
                <span className="font-medium">{t(`status_${h.status}`)}</span>
                {h.note && (
                  <span className="block text-text-muted" dir="auto">
                    {h.note}
                  </span>
                )}
                <span className="block text-xs text-text-muted">
                  {new Date(h.created_at).toLocaleString(locale)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* Ürünler */}
      <section className="rounded-card border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold">{t('items')}</h2>
        <div className="space-y-2">
          {order.order_items.map((it) => (
            <div key={it.id} className="flex justify-between gap-3 text-sm">
              <span dir="auto">
                {it.products.name}{' '}
                <span className="text-text-muted">× {it.quantity}</span>
              </span>
              <span>{formatPrice(it.subtotal, locale)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>{tc('price')}</span>
            <span>{formatPrice(order.subtotal, locale)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>{tco('discount')}</span>
              <span>- {formatPrice(order.discount_amount, locale)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold">
            <span>{tco('total')}</span>
            <span>{formatPrice(order.total_amount, locale)}</span>
          </div>
        </div>
      </section>

      {/* Adres */}
      <section className="rounded-card border border-border bg-surface p-4 text-sm">
        <h2 className="mb-1 font-semibold">{tco('deliveryAddress')}</h2>
        <p className="text-text-muted" dir="auto">
          {formatAddress(order.addresses)}
        </p>
        <p className="mt-1 text-text-muted">
          {order.payment_method === 'card' ? tco('card') : tco('cash')}
        </p>
      </section>

      {CANCELLABLE.includes(order.status) && (
        <div>
          {cancel.isError && (
            <p className="mb-2 text-sm text-danger">
              {(cancel.error as Error).message}
            </p>
          )}
          <button
            type="button"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
            className="rounded-lg border border-danger/40 px-4 py-2 text-sm text-danger hover:bg-danger/10 disabled:opacity-50"
          >
            {t('cancelOrder')}
          </button>
        </div>
      )}
    </div>
  );
}
