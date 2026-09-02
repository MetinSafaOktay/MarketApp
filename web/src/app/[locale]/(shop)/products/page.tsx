import { getTranslations, setRequestLocale } from 'next-intl/server';
import { apiFetch } from '@/lib/api';
import type { Paginated, Product } from '@/lib/types';
import { CategorySidebar } from '@/components/shop/category-sidebar';
import { CatalogToolbar } from '@/components/shop/catalog-toolbar';
import { Pagination } from '@/components/shop/pagination';
import { ProductCard } from '@/components/shop/product-card';

export default async function ProductsPage({
  params,
  searchParams,
}: PageProps<'/[locale]/products'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations('Catalog');
  const tc = await getTranslations('Common');

  const first = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  const category = first(sp.category);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  let result: Paginated<Product> | null = null;
  try {
    result = await apiFetch<Paginated<Product>>('/products', {
      locale,
      params: {
        page,
        pageSize: 24,
        categoryId: category,
        q: first(sp.q),
        sort: first(sp.sort),
        onlyDiscounted: first(sp.onlyDiscounted),
        onlyNew: first(sp.onlyNew),
        inStock: first(sp.inStock),
      },
    });
  } catch {
    result = null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex gap-6">
        <CategorySidebar activeId={category} />

        <section className="min-w-0 flex-1">
          <div className="mb-4 flex items-baseline justify-between">
            <h1 className="text-lg font-semibold">{t('title')}</h1>
            {result && (
              <span className="text-sm text-text-muted">
                {t('resultsCount', { count: result.meta.total })}
              </span>
            )}
          </div>

          <CatalogToolbar />

          {result && result.data.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {result.data.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <Pagination
                page={result.meta.page}
                totalPages={result.meta.totalPages}
              />
            </>
          ) : (
            <div className="rounded-card border border-dashed border-border p-12 text-center text-sm text-text-muted">
              {tc('empty')}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
