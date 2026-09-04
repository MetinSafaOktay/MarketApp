'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, Link } from '@/i18n/navigation';
import { authedApi } from '@/lib/auth';
import { useCart } from '@/lib/use-cart';
import { useAddresses } from '@/lib/use-addresses';
import { formatPrice, formatAddress } from '@/lib/format';
import { cn } from '@/lib/cn';
import type { CheckoutPreview, Order } from '@/lib/types';
import { AddressForm } from './address-form';

type Payment = 'cash_on_delivery' | 'card';

export function CheckoutView() {
  const t = useTranslations('Checkout');
  const tc = useTranslations('Common');
  const tcart = useTranslations('Cart');
  const locale = useLocale();
  const router = useRouter();
  const qc = useQueryClient();

  const { data: cart } = useCart();
  const { data: addresses, isLoading: addrLoading } = useAddresses();

  const [addressId, setAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [payment, setPayment] = useState<Payment>('cash_on_delivery');
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<string | undefined>();

  const selectedAddress =
    addressId ??
    addresses?.find((a) => a.is_default)?.id ??
    addresses?.[0]?.id ??
    null;

  const preview = useQuery({
    queryKey: ['checkout-preview', coupon ?? '', selectedAddress ?? ''],
    queryFn: () =>
      authedApi<CheckoutPreview>('/cart/checkout-preview', {
        method: 'POST',
        locale,
        body: JSON.stringify({
          ...(coupon ? { coupon_code: coupon } : {}),
          ...(selectedAddress ? { address_id: selectedAddress } : {}),
        }),
      }),
    enabled: !!cart && cart.length > 0,
  });

  const placeOrder = useMutation({
    mutationFn: () =>
      authedApi<Order>('/orders', {
        method: 'POST',
        locale,
        body: JSON.stringify({
          address_id: selectedAddress,
          payment_method: payment,
          coupon_code: coupon,
          items: (cart ?? []).map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
        }),
      }),
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['cart'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      router.replace(`/orders/${order.id}`);
    },
  });

  if (cart && cart.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-text-muted">{tcart('empty')}</p>
        <Link href="/products" className="text-sm text-accent hover:underline">
          {tcart('continueShopping')}
        </Link>
      </div>
    );
  }

  const p = preview.data;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Adres */}
        <section>
          <h2 className="mb-2 text-sm font-semibold">{t('deliveryAddress')}</h2>
          {addrLoading ? (
            <p className="text-sm text-text-muted">{tc('loading')}</p>
          ) : addresses && addresses.length > 0 ? (
            <div className="space-y-2">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={cn(
                    'flex cursor-pointer gap-3 rounded-lg border p-3 text-sm',
                    selectedAddress === a.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-surface',
                  )}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedAddress === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-0.5 accent-[var(--color-accent)]"
                  />
                  <span>
                    <span className="font-medium" dir="auto">
                      {a.label}
                    </span>
                    <span className="block text-text-muted" dir="auto">
                      {formatAddress(a)}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted">{t('noAddresses')}</p>
          )}

          {p?.delivery_area_error && (
            <p className="mt-2 text-xs text-danger">{p.delivery_area_error}</p>
          )}

          {showAddressForm ? (
            <AddressForm onDone={() => setShowAddressForm(false)} />
          ) : (
            <button
              type="button"
              onClick={() => setShowAddressForm(true)}
              className="mt-2 inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              <Plus className="size-4" />
              {t('addAddress')}
            </button>
          )}
        </section>

        {/* Ödeme yöntemi */}
        <section>
          <h2 className="mb-2 text-sm font-semibold">{t('paymentMethod')}</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            {(['cash_on_delivery', 'card'] as Payment[]).map((m) => (
              <label
                key={m}
                className={cn(
                  'flex flex-1 cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm',
                  payment === m
                    ? 'border-accent bg-accent/10'
                    : 'border-border bg-surface',
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={payment === m}
                  onChange={() => setPayment(m)}
                  className="accent-[var(--color-accent)]"
                />
                {m === 'cash_on_delivery' ? t('cash') : t('card')}
              </label>
            ))}
          </div>
        </section>

        {/* Kupon */}
        <section>
          <h2 className="mb-2 text-sm font-semibold">{t('couponCode')}</h2>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder={t('couponCode')}
              className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="button"
              onClick={() => setCoupon(couponInput.trim() || undefined)}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-surface-2"
            >
              {t('apply')}
            </button>
          </div>
          {p?.coupon_error && (
            <p className="mt-1 text-xs text-danger">{p.coupon_error}</p>
          )}
          {p?.coupon && (
            <p className="mt-1 text-xs text-success">
              {p.coupon.code} · -
              {p.coupon.discount_type === 'percentage'
                ? `%${p.coupon.discount_value}`
                : formatPrice(String(p.coupon.discount_value), locale)}
            </p>
          )}
        </section>
      </div>

      {/* Özet */}
      <aside className="h-fit rounded-card border border-border bg-surface p-4 lg:sticky lg:top-20">
        <h2 className="mb-3 text-sm font-semibold">{t('orderSummary')}</h2>
        <div className="space-y-1.5 text-sm">
          <Row
            label={tc('price')}
            value={formatPrice(String(p?.subtotal ?? 0), locale)}
          />
          {p && p.discount_amount > 0 && (
            <Row
              label={t('discount')}
              value={`- ${formatPrice(String(p.discount_amount), locale)}`}
              accent
            />
          )}
          <div className="flex justify-between border-t border-border pt-2 font-semibold">
            <span>{t('total')}</span>
            <span>{formatPrice(String(p?.total ?? p?.subtotal ?? 0), locale)}</span>
          </div>
        </div>

        {placeOrder.isError && (
          <p className="mt-3 text-xs text-danger">
            {(placeOrder.error as Error).message}
          </p>
        )}

        <button
          type="button"
          disabled={
            !selectedAddress ||
            placeOrder.isPending ||
            !cart ||
            cart.length === 0 ||
            p?.has_stock_issues ||
            p?.delivery_area_ok === false
          }
          onClick={() => placeOrder.mutate()}
          className="mt-4 w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-fg hover:bg-accent-hover disabled:opacity-50"
        >
          {t('placeOrder')}
        </button>
      </aside>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-text-muted">{label}</span>
      <span className={accent ? 'text-success' : undefined}>{value}</span>
    </div>
  );
}
