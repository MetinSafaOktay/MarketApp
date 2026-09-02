'use client';

import { useSyncExternalStore } from 'react';
import { getToken } from './client-api';

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
