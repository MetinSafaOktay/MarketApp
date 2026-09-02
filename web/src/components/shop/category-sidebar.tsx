import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { apiFetch } from '@/lib/api';
import type { Category } from '@/lib/types';

export async function CategorySidebar({ activeId }: { activeId?: string }) {
  const locale = await getLocale();
  const t = await getTranslations('Category');

  let categories: Category[] = [];
  try {
    categories = await apiFetch<Category[]>('/categories', { locale });
  } catch {
    return null;
  }

  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <div className="sticky top-20 rounded-card border border-border bg-surface p-2">
        <h2 className="px-3 py-2 text-sm font-semibold text-text-muted">
          {t('title')}
        </h2>
        <nav className="flex flex-col">
          <Link
            href="/products"
            className={cx(!activeId)}
          >
            {t('allProducts')}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className={cx(activeId === c.id)}
              dir="auto"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function cx(active: boolean) {
  return [
    'rounded-lg px-3 py-2 text-sm transition-colors',
    active
      ? 'bg-surface-2 font-medium text-text'
      : 'text-text-muted hover:bg-surface-2 hover:text-text',
  ].join(' ');
}
