import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CouponsManager } from '@/components/admin/coupons-manager';

export default async function AdminCouponsPage({
  params,
}: PageProps<'/[locale]/admin/coupons'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');
  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('coupons')}</h1>
      <CouponsManager />
    </>
  );
}
