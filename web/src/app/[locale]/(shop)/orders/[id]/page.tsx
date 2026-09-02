import { setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { OrderDetail } from '@/components/orders/order-detail';

export default async function OrderDetailPage({
  params,
}: PageProps<'/[locale]/orders/[id]'>) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <OrderDetail id={id} />
      </div>
    </RequireAuth>
  );
}
