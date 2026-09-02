'use client';

import { usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

export function Pagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function go(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete('page');
    else params.set('page', String(next));
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      <PageButton disabled={page <= 1} onClick={() => go(page - 1)}>
        <ChevronLeft className="size-4" />
      </PageButton>

      {pageRange(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-2 text-text-muted">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            active={p === page}
            onClick={() => go(p)}
          >
            {p}
          </PageButton>
        ),
      )}

      <PageButton disabled={page >= totalPages} onClick={() => go(page + 1)}>
        <ChevronRight className="size-4" />
      </PageButton>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-border text-sm',
        active
          ? 'bg-accent text-accent-fg'
          : 'bg-surface text-text hover:bg-surface-2',
        disabled && 'cursor-not-allowed opacity-40',
      )}
    >
      {children}
    </button>
  );
}

function pageRange(current: number, total: number): (number | '…')[] {
  const delta = 1;
  const range: (number | '…')[] = [];
  const left = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push('…');
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push('…');
  if (total > 1) range.push(total);

  return range;
}
