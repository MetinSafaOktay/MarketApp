import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MapPin, Phone } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import type { StoreProfile } from '@/lib/types';

export default async function ContactPage({
  params,
}: PageProps<'/[locale]/contact'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Static');
  const store = await apiFetch<StoreProfile>('/store', { locale }).catch(
    () => null,
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">{t('contactTitle')}</h1>
      <div className="space-y-3 text-sm">
        {store?.phone && (
          <p className="flex items-center gap-2">
            <Phone className="size-4 text-accent" />
            {store.phone}
          </p>
        )}
        {(store?.address || store?.city) && (
          <p className="flex items-start gap-2" dir="auto">
            <MapPin className="mt-0.5 size-4 text-accent" />
            {[store?.address, store?.city].filter(Boolean).join(', ')}
          </p>
        )}
      </div>
    </div>
  );
}
