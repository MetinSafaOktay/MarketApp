'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import {
  useCart,
  useClearCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '@/lib/use-cart';
import { formatPrice } from '@/lib/format';
import { QuantityStepper } from '@/components/shop/quantity-stepper';

export function CartView() {
  const t = useTranslations('Cart');
  const tc = useTranslations('Common');
  const locale = useLocale();
  const { data: items, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();

  if (isLoading) {
    return <p className="py-16 text-center text-sm text-text-muted">{tc('loading')}</p>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-text-muted">{t('empty')}</p>
        <Link
          href="/products"
          className="text-sm font-medium text-accent hover:underline"
        >
          {t('continueShopping')}
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, i) => sum + Number(i.products.price) * i.quantity,
    0,
  );
  const hasStockIssue = items.some(
    (i) => i.products.stock_quantity < i.quantity,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-3">
        {items.map((item) => {
          const image = item.products.product_images[0]?.image_url;
          return (
            <div
              key={item.id}
              className="flex gap-3 rounded-card border border-border bg-surface p-3"
            >
              <Link
                href={`/products/${item.product_id}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-surface-2"
              >
                {image && (
                  <Image
                    src={image}
                    alt={item.products.name}
                    fill
                    sizes="80px"
                    className="object-contain"
                  />
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Link
                  href={`/products/${item.product_id}`}
                  className="line-clamp-2 text-sm font-medium hover:text-accent"
                  dir="auto"
                >
                  {item.products.name}
                </Link>
                <span className="text-sm text-accent">
                  {formatPrice(item.products.price, locale)}
                </span>
                {item.products.stock_quantity < item.quantity && (
                  <span className="text-xs text-danger">
                    {tc('outOfStock')} ({item.products.stock_quantity})
                  </span>
                )}
                <div className="mt-1 flex items-center gap-2">
                  <QuantityStepper
                    value={item.quantity}
                    max={item.products.stock_quantity}
                    onChange={(quantity) =>
                      updateItem.mutate({
                        productId: item.product_id,
                        quantity,
                      })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeItem.mutate(item.product_id)}
                    aria-label={t('remove')}
                    className="rounded-lg p-2 text-text-muted hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              <div className="shrink-0 text-sm font-semibold">
                {formatPrice(
                  String(Number(item.products.price) * item.quantity),
                  locale,
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => clearCart.mutate()}
          className="text-xs text-text-muted hover:text-danger"
        >
          {t('clear')}
        </button>
      </div>

      <aside className="h-fit rounded-card border border-border bg-surface p-4 lg:sticky lg:top-20">
        <div className="flex justify-between text-sm">
          <span className="text-text-muted">{t('subtotal')}</span>
          <span>{formatPrice(String(subtotal), locale)}</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
          <span>{t('total')}</span>
          <span>{formatPrice(String(subtotal), locale)}</span>
        </div>

        {hasStockIssue && (
          <p className="mt-3 text-xs text-danger">{t('outOfStockWarning')}</p>
        )}

        <Link
          href="/checkout"
          className="mt-4 block rounded-lg bg-accent py-2.5 text-center text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('checkout')}
        </Link>
      </aside>
    </div>
  );
}
