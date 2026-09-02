'use client';

import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/cn';

const SORTS = ['newest', 'price_asc', 'price_desc'] as const;

export function CatalogToolbar() {
  const t = useTranslations('Catalog');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get('sort') ?? 'newest';

  function update(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    params.delete('page');
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function toggle(key: string) {
    update({ [key]: searchParams.get(key) === 'true' ? null : 'true' });
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <FilterChip
        active={searchParams.get('onlyDiscounted') === 'true'}
        onClick={() => toggle('onlyDiscounted')}
      >
        {t('discounted')}
      </FilterChip>
      <FilterChip
        active={searchParams.get('onlyNew') === 'true'}
        onClick={() => toggle('onlyNew')}
      >
        {t('new')}
      </FilterChip>
      <FilterChip
        active={searchParams.get('inStock') === 'true'}
        onClick={() => toggle('inStock')}
      >
        {t('inStock')}
      </FilterChip>

      <label className="ml-auto flex items-center gap-2 text-sm">
        <span className="text-text-muted">{t('sortBy')}</span>
        <select
          value={sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="rounded-md border border-border bg-surface-2 px-2 py-1.5 outline-none focus:ring-2 focus:ring-accent/40"
        >
          {SORTS.map((s) => (
            <option key={s} value={s}>
              {t(`sort_${s}`)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1.5 text-sm transition-colors',
        active
          ? 'border-accent bg-accent/15 text-accent'
          : 'border-border bg-surface text-text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  );
}
