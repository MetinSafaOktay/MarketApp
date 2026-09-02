import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { CartView } from '@/components/cart/cart-view';

export default async function CartPage({ params }: PageProps<'/[locale]/cart'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Cart');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <CartView />
      </div>
    </RequireAuth>
  );
}
