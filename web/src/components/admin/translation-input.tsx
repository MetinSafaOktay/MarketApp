'use client';

import { useState } from 'react';
import { locales, type Locale } from '@/i18n/routing';
import type { TranslatedText } from '@/lib/admin-types';
import { cn } from '@/lib/cn';

export function TranslationInput({
  label,
  value,
  onChange,
  required,
  textarea,
}: {
  label: string;
  value: TranslatedText;
  onChange: (next: TranslatedText) => void;
  required?: boolean;
  textarea?: boolean;
}) {
  const [active, setActive] = useState<Locale>('tr');

  function set(locale: Locale, text: string) {
    const next = { ...value };
    if (text) next[locale] = text;
    else delete next[locale];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-text-muted">
        {label}
        {required && ' *'}
      </span>
      <div className="flex gap-1">
        {locales.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setActive(l)}
            className={cn(
              'relative rounded-md px-2 py-1 text-xs font-medium uppercase',
              active === l
                ? 'bg-accent text-accent-fg'
                : 'bg-surface-2 text-text-muted hover:text-text',
            )}
          >
            {l}
            {value[l] && (
              <span
                className={cn(
                  'absolute right-0.5 top-0.5 size-1.5 rounded-full',
                  active === l ? 'bg-accent-fg' : 'bg-success',
                )}
              />
            )}
          </button>
        ))}
      </div>
      {textarea ? (
        <textarea
          rows={3}
          dir="auto"
          value={value[active] ?? ''}
          onChange={(e) => set(active, e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
      ) : (
        <input
          dir="auto"
          value={value[active] ?? ''}
          onChange={(e) => set(active, e.target.value)}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
        />
      )}
      {required && active !== 'tr' && !value.tr && (
        <span className="text-xs text-danger">
          {/* tr zorunlu uyarısı */}TR
        </span>
      )}
    </div>
  );
}
