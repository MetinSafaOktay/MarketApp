'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/navigation';
import { ClientApiError } from '@/lib/client-api';
import { useIsAuthenticated } from '@/lib/use-auth';
import { useAddToCart } from '@/lib/use-cart';
import { QuantityStepper } from './quantity-stepper';
import { cn } from '@/lib/cn';

export function ProductPurchasePanel({
  productId,
  stock,
}: {
  productId: string;
  stock: number;
}) {
  const t = useTranslations('Common');
  const tp = useTranslations('Product');
  const tn = useTranslations('Nav');
  const router = useRouter();
  const isAuthed = useIsAuthenticated();
  const addToCart = useAddToCart();
  const [qty, setQty] = useState(1);
  const soldOut = stock <= 0;

  function onAdd() {
    if (!isAuthed) {
      router.push('/login');
      return;
    }
    addToCart.mutate(
      { product_id: productId, quantity: qty },
      {
        onError: (err) => {
          if (err instanceof ClientApiError && err.status === 401) {
            router.push('/login');
          }
        },
      },
    );
  }

  const showError =
    addToCart.isError &&
    !(
      addToCart.error instanceof ClientApiError &&
      addToCart.error.status === 401
    );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-muted">{t('quantity')}</span>
        <QuantityStepper value={qty} onChange={setQty} max={stock} />
      </div>

      <button
        type="button"
        disabled={soldOut || addToCart.isPending}
        onClick={onAdd}
        className={cn(
          'rounded-lg px-6 py-3 text-sm font-semibold transition-colors',
          soldOut
            ? 'cursor-not-allowed bg-surface-2 text-text-muted'
            : 'bg-accent text-accent-fg hover:bg-accent-hover',
          addToCart.isPending && 'opacity-70',
        )}
      >
        {soldOut ? t('outOfStock') : t('addToCart')}
      </button>

      {addToCart.isSuccess && (
        <p className="text-sm text-success">{tp('addedToCart')}</p>
      )}
      {showError && (
        <p className="text-sm text-danger">
          {(addToCart.error as Error).message}
        </p>
      )}
      {!isAuthed && (
        <p className="text-xs text-text-muted">
          <Link href="/login" className="text-accent hover:underline">
            {tn('signIn')}
          </Link>
        </p>
      )}
    </div>
  );
}
