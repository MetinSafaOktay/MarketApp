'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2 } from 'lucide-react';
import { useAdminCoupons, useCouponMutations } from '@/lib/use-admin';
import type { AdminCoupon } from '@/lib/admin-types';
import { cn } from '@/lib/cn';

export function CouponsManager() {
  const t = useTranslations('Admin');
  const tc = useTranslations('Common');
  const { data: coupons, isLoading } = useAdminCoupons();
  const { remove } = useCouponMutations();
  const [editing, setEditing] = useState<AdminCoupon | 'new' | null>(null);

  return (
    <div className="space-y-4">
      {editing ? (
        <CouponForm
          coupon={editing === 'new' ? undefined : editing}
          onDone={() => setEditing(null)}
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditing('new')}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('new')}
        </button>
      )}

      {isLoading ? (
        <p className="text-sm text-text-muted">{tc('loading')}</p>
      ) : (
        <div className="divide-y divide-border rounded-card border border-border text-sm">
          {(coupons ?? []).map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-3 py-2">
              <code className="font-mono font-semibold text-accent">{c.code}</code>
              <span className="text-text-muted">
                {c.discount_type === 'percentage'
                  ? `%${c.discount_value}`
                  : c.discount_value}
              </span>
              {!c.is_active && (
                <span className="rounded bg-surface-2 px-1.5 text-xs text-text-muted">
                  ×
                </span>
              )}
              <button
                type="button"
                onClick={() => setEditing(c)}
                className="ml-auto rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                <Pencil className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => confirm(t('confirmDelete')) && remove.mutate(c.id)}
                className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CouponForm({
  coupon,
  onDone,
}: {
  coupon?: AdminCoupon;
  onDone: () => void;
}) {
  const t = useTranslations('Admin');
  const { create, update } = useCouponMutations();
  const [code, setCode] = useState(coupon?.code ?? '');
  const [type, setType] = useState(coupon?.discount_type ?? 'percentage');
  const [value, setValue] = useState(coupon?.discount_value ?? '');
  const [minAmount, setMinAmount] = useState(coupon?.min_order_amount ?? '0');
  const [limit, setLimit] = useState(String(coupon?.usage_limit_per_user ?? 1));
  const [active, setActive] = useState(coupon?.is_active ?? true);
  const [validFrom, setValidFrom] = useState(toLocalInput(coupon?.valid_from));
  const [validUntil, setValidUntil] = useState(toLocalInput(coupon?.valid_until));
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const body = {
      code: code.trim().toUpperCase(),
      discount_type: type,
      discount_value: Number(value),
      min_order_amount: Number(minAmount),
      usage_limit_per_user: Number(limit),
      is_active: active,
      valid_from: validFrom ? new Date(validFrom).toISOString() : undefined,
      valid_until: validUntil ? new Date(validUntil).toISOString() : undefined,
    };
    try {
      if (coupon) await update.mutateAsync({ id: coupon.id, body });
      else await create.mutateAsync(body);
      onDone();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid max-w-lg grid-cols-2 gap-3 rounded-card border border-border bg-surface p-4 text-sm"
    >
      <F label={t('couponCode')} value={code} onChange={setCode} />
      <label className="flex flex-col gap-1.5">
        <span className="text-text-muted">{t('discountType')}</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
          className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none"
        >
          <option value="percentage">{t('percentage')}</option>
          <option value="fixed">{t('fixed')}</option>
        </select>
      </label>
      <F label={t('discountValue')} value={value} onChange={setValue} type="number" />
      <F label={t('minOrderAmount')} value={minAmount} onChange={setMinAmount} type="number" />
      <F label={t('usageLimit')} value={limit} onChange={setLimit} type="number" />
      <label className="flex items-center gap-2 self-end pb-2">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
          className="accent-[var(--color-accent)]"
        />
        {t('isActive')}
      </label>
      <F
        label={t('validFrom')}
        value={validFrom}
        onChange={setValidFrom}
        type="datetime-local"
      />
      <F
        label={t('validUntil')}
        value={validUntil}
        onChange={setValidUntil}
        type="datetime-local"
      />
      {error && <p className="col-span-2 text-danger">{error}</p>}
      <div className="col-span-2 flex gap-2">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg hover:bg-accent-hover"
        >
          {t('save')}
        </button>
        <button
          type="button"
          onClick={onDone}
          className={cn('rounded-lg border border-border px-4 py-2 hover:bg-surface-2')}
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  );
}

/** ISO string → datetime-local input değeri (yerel saat). */
function toLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function F({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-text-muted">{label}</span>
      <input
        type={type}
        step={type === 'number' ? 'any' : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2 outline-none focus:ring-2 focus:ring-accent/40"
      />
    </label>
  );
}
