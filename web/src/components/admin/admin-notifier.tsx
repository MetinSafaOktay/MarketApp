'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useAdminStats } from '@/lib/use-admin';

type Toast = { id: number; text: string; href: string };

type Counts = { orders: number; messages: number; customers: number };

const TOAST_TTL_MS = 8_000;

/**
 * Admin panosunda sağ üstte "yeni sipariş / mesaj / müşteri" toast'ı gösterir.
 * `useAdminStats` 20 sn'de bir yenilendiği için, bir sayaç artınca aradaki fark
 * kadar bildirim düşer. Kenar çubuğu rozetleri bekleyen toplamı; bu toast ise
 * "ekran açıkken yeni geleni" gösterir.
 *
 * Admin layout'u sayfa geçişlerinde yeniden mount OLMADIĞI için `seenRef`
 * gezinme boyunca korunur — localStorage'a gerek yok.
 */
export function AdminNotifier() {
  const t = useTranslations('Admin');
  const router = useRouter();
  const { data: stats } = useAdminStats();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seenRef = useRef<Counts | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    if (!stats) return;
    const current: Counts = {
      orders: stats.orders.active,
      messages: stats.messaging.unread_conversations,
      customers: stats.customers.new_today,
    };

    // İlk ölçüm sadece baz çizgisi — açılışta bekleyenler için toast atma.
    if (seenRef.current == null) {
      seenRef.current = current;
      return;
    }

    const prev = seenRef.current;
    const fresh: Toast[] = [];
    const add = (delta: number, key: string, href: string) => {
      if (delta > 0) {
        fresh.push({
          id: ++idRef.current,
          text: t(key, { count: delta }),
          href,
        });
      }
    };
    add(current.orders - prev.orders, 'notify_orders', '/admin/orders');
    add(current.messages - prev.messages, 'notify_messages', '/admin/messages');
    add(current.customers - prev.customers, 'notify_customers', '/admin/customers');

    seenRef.current = current;
    if (fresh.length === 0) return;

    setToasts((cur) => [...cur, ...fresh]);
    for (const toast of fresh) {
      setTimeout(() => {
        setToasts((cur) => cur.filter((x) => x.id !== toast.id));
      }, TOAST_TTL_MS);
    }
  }, [stats, t]);

  function dismiss(id: number) {
    setToasts((cur) => cur.filter((x) => x.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-72 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm shadow-lg"
        >
          <button
            type="button"
            onClick={() => {
              dismiss(toast.id);
              router.push(toast.href);
            }}
            className="flex-1 text-left font-medium hover:underline"
          >
            {toast.text}
          </button>
          <button
            type="button"
            onClick={() => dismiss(toast.id)}
            aria-label="Kapat"
            className="shrink-0 text-text-muted hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
