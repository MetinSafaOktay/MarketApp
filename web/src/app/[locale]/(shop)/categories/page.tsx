import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { apiFetch } from '@/lib/api';
import type { Category } from '@/lib/types';

export default async function CategoriesPage({
  params,
}: PageProps<'/[locale]/categories'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Category');
  const tc = await getTranslations('Common');

  const categories = await apiFetch<Category[]>('/categories', { locale }).catch(
    () => [],
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-xl font-bold">{t('title')}</h1>

      {categories.length === 0 ? (
        <p className="text-sm text-text-muted">{tc('empty')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className="group overflow-hidden rounded-card border border-border bg-surface"
            >
              <div className="relative aspect-[4/3] bg-surface-2">
                {c.image_url ? (
                  <Image
                    src={c.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 220px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : null}
              </div>
              <div className="p-3 text-sm font-medium" dir="auto">
                {c.name}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
