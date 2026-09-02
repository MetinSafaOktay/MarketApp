import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CustomersTable } from '@/components/admin/customers-table';

export default async function AdminCustomersPage({
  params,
}: PageProps<'/[locale]/admin/customers'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('customers')}</h1>
      <CustomersTable />
    </>
  );
}
