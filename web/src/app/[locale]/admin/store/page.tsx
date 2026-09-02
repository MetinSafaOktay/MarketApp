import { getTranslations, setRequestLocale } from 'next-intl/server';
import { StoreForm } from '@/components/admin/store-form';

export default async function AdminStorePage({
  params,
}: PageProps<'/[locale]/admin/store'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');

  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('storeSettings')}</h1>
      <StoreForm />
    </>
  );
}
