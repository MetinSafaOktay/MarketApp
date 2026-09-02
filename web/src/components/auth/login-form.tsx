'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useRouter } from '@/i18n/navigation';
import { login } from '@/lib/auth';
import { ClientApiError } from '@/lib/client-api';
import { AuthField } from './auth-field';

export function LoginForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    try {
      await login(
        String(form.get('email')),
        String(form.get('password')),
      );
      await qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      const next = params.get('next');
      router.replace(next && next.startsWith('/') ? next : '/account');
    } catch (err) {
      setError(
        err instanceof ClientApiError ? err.message : t('genericError'),
      );
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <AuthField label={t('email')} name="email" type="email" autoComplete="email" />
      <AuthField
        label={t('password')}
        name="password"
        type="password"
        autoComplete="current-password"
      />

      {error && <p className="text-sm text-danger">{error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-60"
      >
        {t('loginCta')}
      </button>

      <p className="text-center text-sm text-text-muted">
        {t('noAccount')}{' '}
        <Link
          href={{
            pathname: '/register',
            query: params.get('next') ? { next: params.get('next')! } : {},
          }}
          className="text-accent hover:underline"
        >
          {t('createOne')}
        </Link>
      </p>
    </form>
  );
}
