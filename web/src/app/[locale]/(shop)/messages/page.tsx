import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { CustomerChat } from '@/components/shop/customer-chat';

export default async function MessagesPage({
  params,
}: PageProps<'/[locale]/messages'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Messages');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-xl font-bold">{t('storeName')}</h1>
        <CustomerChat />
      </div>
    </RequireAuth>
  );
}
