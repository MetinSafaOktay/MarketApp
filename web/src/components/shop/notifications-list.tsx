'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/lib/use-notifications';
import { cn } from '@/lib/cn';

export function NotificationsList() {
  const t = useTranslations('Notifications');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  if (isLoading)
    return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  if (!notifications || notifications.length === 0)
    return <p className="py-12 text-center text-text-muted">{t('empty')}</p>;

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="space-y-2">
      {hasUnread && (
        <button
          type="button"
          onClick={() => markAll.mutate()}
          className="text-sm text-accent hover:underline"
        >
          {t('markAllRead')}
        </button>
      )}
      {notifications.map((n) => {
        const inner = (
          <div
            className={cn(
              'rounded-card border border-border p-3',
              n.is_read ? 'bg-surface' : 'bg-surface-2',
            )}
          >
            <div className="flex items-start gap-2">
              {!n.is_read && (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium" dir="auto">
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-sm text-text-muted" dir="auto">
                    {n.body}
                  </p>
                )}
                <p className="mt-1 text-xs text-text-muted">
                  {new Date(n.created_at).toLocaleString(locale)}
                </p>
              </div>
            </div>
          </div>
        );

        return n.related_order_id ? (
          <Link
            key={n.id}
            href={`/orders/${n.related_order_id}`}
            onClick={() => !n.is_read && markRead.mutate(n.id)}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={n.id}
            type="button"
            onClick={() => !n.is_read && markRead.mutate(n.id)}
            className="block w-full text-left"
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}
