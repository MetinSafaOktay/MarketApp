'use client';

import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Ticket,
  Megaphone,
  ShoppingBag,
  MessageSquare,
  Users,
  Store,
  ArrowLeft,
} from 'lucide-react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { useAdminStats } from '@/lib/use-admin';

const NAV = [
  { href: '/admin', key: 'dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', key: 'orders', icon: ShoppingBag, exact: false },
  { href: '/admin/products', key: 'products', icon: Package, exact: false },
  { href: '/admin/categories', key: 'categories', icon: FolderTree, exact: false },
  { href: '/admin/coupons', key: 'coupons', icon: Ticket, exact: false },
  { href: '/admin/announcements', key: 'announcements', icon: Megaphone, exact: false },
  { href: '/admin/messages', key: 'messages', icon: MessageSquare, exact: false },
  { href: '/admin/customers', key: 'customers', icon: Users, exact: false },
  { href: '/admin/store', key: 'storeSettings', icon: Store, exact: false },
] as const;

export function AdminSidebar() {
  const t = useTranslations('Admin');
  const pathname = usePathname();
  const { data: stats } = useAdminStats();

  // Nav anahtarı → dikkat gerektiren adet (0/undefined ise rozet gösterilmez).
  const badges: Partial<Record<string, number>> = {
    orders: stats?.orders.active,
    messages: stats?.messaging.unread_conversations,
    customers: stats?.customers.new_today,
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="border-b border-border px-4 py-4">
        <span className="text-sm font-bold text-brand">ERENLER</span>
        <span className="ml-1 text-xs text-text-muted">{t('panel')}</span>
      </div>
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map(({ href, key, icon: Icon, exact }) => {
          const active = exact
            ? pathname === href
            : pathname === href || pathname.startsWith(href + '/');
          const badge = badges[key];
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-surface-2 font-medium text-text'
                  : 'text-text-muted hover:bg-surface-2 hover:text-text',
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{t(key)}</span>
              {badge != null && badge > 0 && (
                <span className="min-w-5 rounded-full bg-brand px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-white">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-text-muted hover:text-text"
      >
        <ArrowLeft className="size-4" />
        {t('backToStore')}
      </Link>
    </aside>
  );
}
