'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useOrders } from '@/lib/use-orders';
import { formatPrice } from '@/lib/format';
import { OrderStatusBadge } from './order-status-badge';

export function OrdersList() {
  const t = useTranslations('Orders');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-text-muted">{tc('loading')}</p>;
  }
  if (!orders || orders.length === 0) {
    return <p className="py-16 text-center text-text-muted">{t('empty')}</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Link
          key={o.id}
          href={`/orders/${o.id}`}
          className="flex items-center gap-4 rounded-card border border-border bg-surface p-4 hover:bg-surface-2"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t('orderNumber')} #{o.id.slice(0, 8)}
              </span>
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="mt-0.5 text-xs text-text-muted">
              {new Date(o.created_at).toLocaleDateString(locale)} ·{' '}
              {o.order_items.length} {t('items').toLowerCase()}
            </p>
          </div>
          <span className="text-sm font-semibold">
            {formatPrice(o.total_amount, locale)}
          </span>
          <ChevronRight className="size-4 text-text-muted" />
        </Link>
      ))}
    </div>
  );
}
