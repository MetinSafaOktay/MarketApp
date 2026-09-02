import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import type { Product } from '@/lib/types';
import { formatPrice, isDiscounted } from '@/lib/format';
import { cn } from '@/lib/cn';

export async function ProductCard({ product }: { product: Product }) {
  const locale = await getLocale();
  const t = await getTranslations('Product');
  const tc = await getTranslations('Common');

  const image = product.product_images[0]?.image_url;
  const discounted = isDiscounted(product.price, product.original_price);
  const soldOut = product.stock_quantity <= 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-card border border-border bg-surface">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 240px"
            className="object-contain transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-muted">
            {product.name}
          </div>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {product.is_new_arrival && (
            <span className="rounded bg-surface-2/90 px-2 py-0.5 text-[11px] font-medium text-text">
              {t('newBadge')}
            </span>
          )}
          {discounted && (
            <span className="rounded bg-danger/90 px-2 py-0.5 text-[11px] font-medium text-white">
              {t('discountBadge')}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-accent">
            {formatPrice(product.price, locale)}
          </span>
          {discounted && (
            <span className="text-xs text-text-muted line-through">
              {formatPrice(product.original_price!, locale)}
            </span>
          )}
        </div>

        <Link
          href={`/products/${product.id}`}
          className="line-clamp-2 text-sm text-text hover:text-accent"
          dir="auto"
        >
          {product.name}
        </Link>

        <span className="mt-0.5 text-[11px] text-text-muted">
          {t('stockCode')}: {product.sku}
        </span>

        <button
          type="button"
          disabled={soldOut}
          className={cn(
            'mt-2 w-full rounded-lg py-2 text-sm font-medium transition-colors',
            soldOut
              ? 'cursor-not-allowed bg-surface-2 text-text-muted'
              : 'bg-accent text-accent-fg hover:bg-accent-hover',
          )}
        >
          {soldOut ? tc('outOfStock') : tc('addToCart')}
        </button>
      </div>
    </div>
  );
}
