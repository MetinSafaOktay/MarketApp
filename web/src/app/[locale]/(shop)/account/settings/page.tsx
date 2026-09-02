import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { SettingsView } from '@/components/account/settings-view';

export default async function SettingsPage({
  params,
}: PageProps<'/[locale]/account/settings'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Settings');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <SettingsView />
      </div>
    </RequireAuth>
  );
}
