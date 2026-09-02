'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useAdminProduct } from '@/lib/use-admin';
import { ProductForm } from '@/components/admin/product-form';

export default function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const { data: product, isLoading } = useAdminProduct(id);

  if (isLoading) return <p className="text-sm text-text-muted">{tc('loading')}</p>;
  if (!product) return <p className="text-sm text-danger">{tc('error')}</p>;

  return (
    <>
      <h1 className="mb-6 text-xl font-bold" dir="auto">
        {t('edit')} · {product.name.tr ?? product.sku}
      </h1>
      <ProductForm product={product} />
    </>
  );
}
