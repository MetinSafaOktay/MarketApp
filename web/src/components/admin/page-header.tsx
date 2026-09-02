import { Plus } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export function PageHeader({
  title,
  newHref,
  newLabel,
}: {
  title: string;
  newHref?: string;
  newLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h1 className="text-xl font-bold">{title}</h1>
      {newHref && (
        <Link
          href={newHref}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          <Plus className="size-4" />
          {newLabel}
        </Link>
      )}
    </div>
  );
}
