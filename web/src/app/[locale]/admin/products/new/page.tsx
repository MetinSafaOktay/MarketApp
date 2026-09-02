import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductForm } from '@/components/admin/product-form';

export default async function NewProductPage({
  params,
}: PageProps<'/[locale]/admin/products/new'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Admin');

  return (
    <>
      <h1 className="mb-6 text-xl font-bold">
        {t('products')} · {t('new')}
      </h1>
      <ProductForm />
    </>
  );
}
