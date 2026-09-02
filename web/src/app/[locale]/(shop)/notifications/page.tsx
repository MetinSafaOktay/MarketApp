import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { NotificationsList } from '@/components/shop/notifications-list';

export default async function NotificationsPage({
  params,
}: PageProps<'/[locale]/notifications'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Notifications');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <NotificationsList />
      </div>
    </RequireAuth>
  );
}
