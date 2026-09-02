import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function PrivacyPage({
  params,
}: PageProps<'/[locale]/privacy'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Static');

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold">{t('privacyTitle')}</h1>
      <p className="text-sm text-text-muted">{t('placeholderLegal')}</p>
    </div>
  );
}
