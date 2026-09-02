'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useIsAuthenticated } from '@/lib/use-auth';

/**
 * Client-side rota koruması. Token localStorage'da olduğu için sunucu
 * kontrol edemiyor; oturum yoksa /login?next=... 'e yönlendirir.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthed = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();
  const tc = useTranslations('Common');

  useEffect(() => {
    if (!isAuthed) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthed, pathname, router]);

  if (!isAuthed) {
    return (
      <div className="py-20 text-center text-sm text-text-muted">
        {tc('loading')}
      </div>
    );
  }

  return <>{children}</>;
}
