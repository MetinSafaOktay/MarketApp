'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useMutation } from '@tanstack/react-query';
import { Link, useRouter } from '@/i18n/navigation';
import { clientApi, ClientApiError } from '@/lib/client-api';
import { useIsAuthenticated } from '@/lib/use-auth';
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
  const locale = useLocale();
  const router = useRouter();
  const isAuthed = useIsAuthenticated();
  const [qty, setQty] = useState(1);
  const soldOut = stock <= 0;

  const mutation = useMutation({
    mutationFn: () =>
      clientApi('/cart/items', {
        method: 'POST',
        auth: true,
        locale,
        body: JSON.stringify({ product_id: productId, quantity: qty }),
      }),
    onError: (err) => {
      if (err instanceof ClientApiError && err.status === 401) {
        router.push('/login');
      }
    },
  });

  function onAdd() {
    if (!isAuthed) {
      router.push('/login');
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-muted">{t('quantity')}</span>
        <QuantityStepper value={qty} onChange={setQty} max={stock} />
      </div>

      <button
        type="button"
        disabled={soldOut || mutation.isPending}
        onClick={onAdd}
        className={cn(
          'rounded-lg px-6 py-3 text-sm font-semibold transition-colors',
          soldOut
            ? 'cursor-not-allowed bg-surface-2 text-text-muted'
            : 'bg-accent text-accent-fg hover:bg-accent-hover',
          mutation.isPending && 'opacity-70',
        )}
      >
        {soldOut ? t('outOfStock') : t('addToCart')}
      </button>

      {mutation.isSuccess && (
        <p className="text-sm text-success">{tp('addedToCart')}</p>
      )}
      {mutation.isError &&
        !(
          mutation.error instanceof ClientApiError &&
          mutation.error.status === 401
        ) && (
          <p className="text-sm text-danger">
            {(mutation.error as Error).message}
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
