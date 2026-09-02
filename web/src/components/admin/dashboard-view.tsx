'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useAdminStats } from '@/lib/use-admin';
import { formatPrice } from '@/lib/format';

export function DashboardView() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data, isLoading } = useAdminStats();

  if (isLoading || !data) {
    return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  }

  const cards = [
    { label: t('stats_activeOrders'), value: data.orders.active, highlight: data.orders.active > 0 },
    { label: t('stats_todayOrders'), value: data.orders.today },
    { label: t('stats_orders'), value: data.orders.total },
    {
      label: t('stats_revenue'),
      value: formatPrice(String(data.revenue.last_7_days), locale),
    },
    {
      label: t('stats_revenueAll'),
      value: formatPrice(String(data.revenue.all_time), locale),
    },
    { label: t('stats_customers'), value: data.customers.total },
    {
      label: t('stats_lowStock'),
      value: data.products.low_stock,
      highlight: data.products.low_stock > 0,
    },
    {
      label: t('stats_outOfStock'),
      value: data.products.out_of_stock,
      highlight: data.products.out_of_stock > 0,
    },
    {
      label: t('stats_unreadMessages'),
      value: data.messaging.unread_conversations,
      highlight: data.messaging.unread_conversations > 0,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-card border border-border bg-surface p-4"
        >
          <p className="text-xs text-text-muted">{c.label}</p>
          <p
            className={`mt-1 text-2xl font-bold ${
              c.highlight ? 'text-accent' : ''
            }`}
          >
            {c.value}
          </p>
        </div>
      ))}
    </div>
  );
}
