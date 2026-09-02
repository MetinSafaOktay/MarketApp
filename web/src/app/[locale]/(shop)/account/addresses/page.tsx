import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RequireAuth } from '@/components/auth/require-auth';
import { AddressesManager } from '@/components/account/addresses-manager';

export default async function AddressesPage({
  params,
}: PageProps<'/[locale]/account/addresses'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Addresses');

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>
        <AddressesManager />
      </div>
    </RequireAuth>
  );
}
