'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useWishlist, useToggleWishlist } from '@/lib/use-wishlist';
import { useAddToCart } from '@/lib/use-cart';
import { formatPrice } from '@/lib/format';

export function WishlistView() {
  const t = useTranslations('Wishlist');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: items, isLoading } = useWishlist();
  const { toggle } = useToggleWishlist();
  const addToCart = useAddToCart();

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-text-muted">{tc('loading')}</p>;
  }
  if (!items || items.length === 0) {
    return <p className="py-16 text-center text-text-muted">{t('empty')}</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const image = item.products.product_images[0]?.image_url;
        const soldOut = item.products.stock_quantity <= 0;
        return (
          <div
            key={item.id}
            className="flex flex-col overflow-hidden rounded-card border border-border bg-surface"
          >
            <Link
              href={`/products/${item.product_id}`}
              className="relative aspect-square bg-surface-2"
            >
              {image ? (
                <Image
                  src={image}
                  alt={item.products.name}
                  fill
                  sizes="240px"
                  className="object-contain"
                />
              ) : (
                <span className="grid h-full place-items-center p-2 text-center text-xs text-text-muted">
                  {item.products.name}
                </span>
              )}
            </Link>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <span className="text-sm font-semibold text-accent">
                {formatPrice(item.products.price, locale)}
              </span>
              <Link
                href={`/products/${item.product_id}`}
                className="line-clamp-2 text-sm hover:text-accent"
                dir="auto"
              >
                {item.products.name}
              </Link>
              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={() =>
                    addToCart.mutate({ product_id: item.product_id })
                  }
                  className="flex-1 rounded-lg bg-accent py-2 text-xs font-medium text-accent-fg hover:bg-accent-hover disabled:bg-surface-2 disabled:text-text-muted"
                >
                  {soldOut ? tc('outOfStock') : tc('addToCart')}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(item.product_id)}
                  aria-label={tc('retry')}
                  className="rounded-lg border border-border p-2 text-text-muted hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
