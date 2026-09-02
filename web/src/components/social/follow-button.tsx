'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { ClientApiError } from '@/lib/client-api';
import { useIsAuthenticated } from '@/lib/use-auth';
import { useFollow } from '@/lib/use-social';
import { cn } from '@/lib/cn';

export function FollowButton({ userId }: { userId: string }) {
  const t = useTranslations('Social');
  const isAuthed = useIsAuthenticated();
  const router = useRouter();
  const { follow, unfollow } = useFollow(userId);

  // Backend takip durumunu döndürmüyor; optimistik tutuyoruz.
  const [following, setFollowing] = useState<boolean | null>(null);

  function onClick() {
    if (!isAuthed) {
      router.push('/login');
      return;
    }
    if (following) {
      unfollow.mutate(undefined, { onSuccess: () => setFollowing(false) });
    } else {
      follow.mutate(undefined, {
        onSuccess: () => setFollowing(true),
        onError: (err) => {
          // zaten takip ediliyorsa (409) durumu düzelt
          if (err instanceof ClientApiError && err.status === 409) {
            setFollowing(true);
          }
        },
      });
    }
  }

  const busy = follow.isPending || unfollow.isPending;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        'rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60',
        following
          ? 'border border-border bg-surface text-text hover:bg-surface-2'
          : 'bg-accent text-accent-fg hover:bg-accent-hover',
      )}
    >
      {following ? t('unfollow') : t('follow')}
    </button>
  );
}
