'use client';

import { useTranslations } from 'next-intl';
import { ShoppingCart } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useCartCount } from '@/lib/use-cart';

export function CartLink() {
  const t = useTranslations('Nav');
  const count = useCartCount();

  return (
    <Link
      href="/cart"
      aria-label={t('cart')}
      title={t('cart')}
      className="relative rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
    >
      <ShoppingCart className="size-5" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </Link>
  );
}
