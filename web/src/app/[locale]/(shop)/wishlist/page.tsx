import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { WishlistView } from '@/components/wishlist/wishlist-view';

export default async function WishlistPage({
  params,
}: PageProps<'/[locale]/wishlist'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Wishlist');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <WishlistView />
      </div>
    </RequireAuth>
  );
}
