import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CategoriesManager } from '@/components/admin/categories-manager';

export default async function AdminCategoriesPage({
  params,
}: PageProps<'/[locale]/admin/categories'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');

  return (
    <>
      <h1 className="mb-6 text-xl font-bold">{t('categories')}</h1>
      <CategoriesManager />
    </>
  );
}
