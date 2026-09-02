'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getToken } from './client-api';
import { fetchMe, logout as doLogout, type AuthUser } from './auth';

function subscribe(cb: () => void) {
  window.addEventListener('marketapp:auth', cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener('marketapp:auth', cb);
    window.removeEventListener('storage', cb);
  };
}

/**
 * Oturum durumu (token var mı). SSR'da ve ilk client render'da `false` döner,
 * hydration'dan sonra gerçek değere geçer → mismatch yok.
 */
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => getToken() !== null,
    () => false,
  );
}

export function useCurrentUser(): {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const isAuthenticated = useIsAuthenticated();
  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: fetchMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60_000,
    retry: false,
  });

  return {
    user: isAuthenticated ? (query.data ?? null) : null,
    isLoading: isAuthenticated && query.isLoading,
    isAuthenticated,
  };
}

export function useLogout() {
  const qc = useQueryClient();
  return useCallback(async () => {
    await doLogout();
    qc.clear();
  }, [qc]);
}
