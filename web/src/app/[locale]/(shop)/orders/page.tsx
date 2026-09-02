import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { OrdersList } from '@/components/orders/orders-list';

export default async function OrdersPage({
  params,
}: PageProps<'/[locale]/orders'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Orders');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <OrdersList />
      </div>
    </RequireAuth>
  );
}
