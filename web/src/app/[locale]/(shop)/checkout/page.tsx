import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { CheckoutView } from '@/components/checkout/checkout-view';

export default async function CheckoutPage({
  params,
}: PageProps<'/[locale]/checkout'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Checkout');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <CheckoutView />
      </div>
    </RequireAuth>
  );
}
