'use client';

import { useTranslations } from 'next-intl';
import { Bell } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useUnreadNotificationCount } from '@/lib/use-notifications';

export function NotificationsBell() {
  const t = useTranslations('Nav');
  const count = useUnreadNotificationCount();

  return (
    <Link
      href="/notifications"
      aria-label={t('notifications')}
      title={t('notifications')}
      className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
    >
      <Bell className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
