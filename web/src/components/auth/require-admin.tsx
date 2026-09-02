'use client';

import { useEffect, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { getToken } from '@/lib/client-api';
import { useCurrentUser } from '@/lib/use-auth';

/**
 * Admin rota koruması. Oturum yoksa /login'e, admin değilse uyarı gösterir.
 * Yönlendirme kararı mount sonrası token'a bakar (ilk render'da atmaz).
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const tc = useTranslations('Common');
  const ta = useTranslations('Admin');

  useEffect(() => {
    if (!getToken()) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [pathname, router]);

  if (isLoading || !user) {
    return (
      <div className="py-20 text-center text-sm text-text-muted">
        {tc('loading')}
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="py-20 text-center text-sm text-danger">
        {ta('notAuthorized')}
      </div>
    );
  }

  return <>{children}</>;
}
