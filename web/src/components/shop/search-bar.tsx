'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Search } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';

export function SearchBar() {
  const t = useTranslations('Nav');
  const router = useRouter();
  const [value, setValue] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
  }

  return (
    <form onSubmit={submit} className="relative hidden flex-1 sm:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent/40"
      />
    </form>
  );
}
