'use client';

import { useTranslations } from 'next-intl';
import type { OrderStatus } from '@/lib/types';
import { cn } from '@/lib/cn';

const STYLES: Record<OrderStatus, string> = {
  pending: 'bg-surface-2 text-text-muted',
  confirmed: 'bg-accent/15 text-accent',
  preparing: 'bg-accent/15 text-accent',
  out_for_delivery: 'bg-accent/20 text-accent',
  delivered: 'bg-success/15 text-success',
  cancelled: 'bg-danger/15 text-danger',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useTranslations('Orders');
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium',
        STYLES[status],
      )}
    >
      {t(`status_${status}`)}
    </span>
  );
}
