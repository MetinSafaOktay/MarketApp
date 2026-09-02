'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getToken } from '@/lib/client-api';

type Status = 'loading' | 'authed' | 'guest';

/**
 * Client-side rota koruması. Token localStorage'da olduğu için sunucu
 * kontrol edemez; ilk render'da "loading", mount sonrası gerçek durum.
 * Oturum yoksa /login?next=... 'e yönlendirir.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const router = useRouter();
  const pathname = usePathname();
  const tc = useTranslations('Common');

  useEffect(() => {
    const check = () => setStatus(getToken() ? 'authed' : 'guest');
    check();
    window.addEventListener('marketapp:auth', check);
    window.addEventListener('storage', check);
    return () => {
      window.removeEventListener('marketapp:auth', check);
      window.removeEventListener('storage', check);
    };
  }, []);

  useEffect(() => {
    if (status === 'guest') {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  if (status !== 'authed') {
    return (
      <div className="py-20 text-center text-sm text-text-muted">
        {tc('loading')}
      </div>
    );
  }

  return <>{children}</>;
}
