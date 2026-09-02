import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DashboardView } from '@/components/admin/dashboard-view';

export default async function AdminDashboardPage({
  params,
}: PageProps<'/[locale]/admin'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');

  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('dashboard')}</h1>
      <DashboardView />
    </>
  );
}
