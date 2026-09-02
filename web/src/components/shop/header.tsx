import { getTranslations } from 'next-intl/server';
import { Bell, MessageCircle, Search, ShoppingCart, User } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';

export async function Header() {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-extrabold tracking-tight text-brand">
            ERENLER
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Market
          </span>
        </Link>

        <div className="relative hidden flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            type="search"
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-lg border border-border bg-surface-2 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-text-muted focus:ring-2 focus:ring-accent/40"
          />
        </div>

        <nav className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <IconLink href="/messages" label={t('messages')}>
            <MessageCircle className="size-5" />
          </IconLink>
          <IconLink href="/notifications" label={t('notifications')}>
            <Bell className="size-5" />
          </IconLink>
          <IconLink href="/cart" label={t('cart')}>
            <ShoppingCart className="size-5" />
          </IconLink>
          <IconLink href="/account" label={t('account')}>
            <User className="size-5" />
          </IconLink>
        </nav>
      </div>
    </header>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
    >
      {children}
    </Link>
  );
}
