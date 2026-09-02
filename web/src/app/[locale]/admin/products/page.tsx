import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHeader } from '@/components/admin/page-header';
import { ProductsTable } from '@/components/admin/products-table';

export default async function AdminProductsPage({
  params,
}: PageProps<'/[locale]/admin/products'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');

  return (
    <>
      <PageHeader
        title={t('products')}
        newHref="/admin/products/new"
        newLabel={t('new')}
      />
      <ProductsTable />
    </>
  );
}
