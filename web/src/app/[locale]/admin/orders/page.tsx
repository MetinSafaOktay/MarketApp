import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AdminOrdersTable } from '@/components/admin/admin-orders';

export default async function AdminOrdersPage({
  params,
}: PageProps<'/[locale]/admin/orders'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');

  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('orders')}</h1>
      <AdminOrdersTable />
    </>
  );
}
