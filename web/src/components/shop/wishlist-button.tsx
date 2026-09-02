'use client';

import { Heart } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useIsAuthenticated } from '@/lib/use-auth';
import { useToggleWishlist } from '@/lib/use-wishlist';
import { cn } from '@/lib/cn';

export function WishlistButton({ productId }: { productId: string }) {
  const isAuthed = useIsAuthenticated();
  const router = useRouter();
  const { isSaved, toggle, pending } = useToggleWishlist();
  const saved = isAuthed && isSaved(productId);

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => (isAuthed ? toggle(productId) : router.push('/login'))}
      aria-pressed={saved}
      className={cn(
        'grid size-10 place-items-center rounded-full border border-border transition-colors',
        saved ? 'bg-accent/15 text-accent' : 'bg-surface text-text-muted hover:text-text',
      )}
    >
      <Heart className={cn('size-5', saved && 'fill-current')} />
    </button>
  );
}
