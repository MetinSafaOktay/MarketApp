import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiFetch } from '@/lib/api';
import type { StoreProfile } from '@/lib/types';

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Static' });
  return { title: `${t('aboutTitle')} — Erenler Market` };
}

export default async function AboutPage({
  params,
}: PageProps<'/[locale]/about'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Static');
  const store = await apiFetch<StoreProfile>('/store', { locale }).catch(
    () => null,
  );

  const hours = store?.working_hours as Record<string, string> | null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold" dir="auto">
        {store?.name ?? 'Erenler Market'}
      </h1>
      {store?.city && <p className="mt-1 text-text-muted">{store.city}</p>}

      {store?.description && (
        <p className="mt-4 whitespace-pre-line text-text-muted" dir="auto">
          {store.description}
        </p>
      )}

      {hours && Object.keys(hours).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 text-sm font-semibold">{t('workingHours')}</h2>
          <dl className="space-y-1 text-sm">
            {Object.entries(hours).map(([day, val]) => (
              <div key={day} className="flex justify-between">
                <dt className="text-text-muted">{day}</dt>
                <dd>{val}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {(store?.phone || store?.address) && (
        <section className="mt-8 space-y-1 text-sm">
          {store?.phone && (
            <p>
              <span className="text-text-muted">{t('phone')}: </span>
              {store.phone}
            </p>
          )}
          {store?.address && (
            <p dir="auto">
              <span className="text-text-muted">{t('address')}: </span>
              {store.address}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
