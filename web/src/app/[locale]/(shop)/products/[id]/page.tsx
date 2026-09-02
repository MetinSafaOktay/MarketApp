import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import type { Product } from '@/lib/types';
import { formatPrice, isDiscounted } from '@/lib/format';
import { ProductGallery } from '@/components/shop/product-gallery';
import { ProductPurchasePanel } from '@/components/shop/product-purchase-panel';
import { ProductCard } from '@/components/shop/product-card';

async function getProduct(id: string, locale: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${id}`, { locale });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/products/[id]'>): Promise<Metadata> {
  const { locale, id } = await params;
  const product = await getProduct(id, locale);
  return { title: product ? `${product.name} — Erenler Market` : 'Erenler Market' };
}

export default async function ProductDetailPage({
  params,
}: PageProps<'/[locale]/products/[id]'>) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Product');

  const product = await getProduct(id, locale);
  if (!product) notFound();

  const similar = await apiFetch<Product[]>(`/products/${id}/similar`, {
    locale,
    params: { limit: 6 },
  }).catch(() => []);

  const discounted = isDiscounted(product.price, product.original_price);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <Link
        href="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text"
      >
        <ChevronLeft className="size-4" />
        {t('backToProducts')}
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={product.product_images} alt={product.name} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-xl font-bold" dir="auto">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              {t('stockCode')}: {product.sku}
            </p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-accent">
              {formatPrice(product.price, locale)}
            </span>
            {discounted && (
              <span className="text-text-muted line-through">
                {formatPrice(product.original_price!, locale)}
              </span>
            )}
          </div>

          <ProductPurchasePanel
            productId={product.id}
            stock={product.stock_quantity}
          />

          {product.description && (
            <div className="mt-2 border-t border-border pt-4">
              <h2 className="mb-1 text-sm font-semibold">{t('description')}</h2>
              <p
                className="whitespace-pre-line text-sm text-text-muted"
                dir="auto"
              >
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-lg font-semibold">{t('similarProducts')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
