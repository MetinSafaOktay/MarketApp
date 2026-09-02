import { getTranslations } from 'next-intl/server';
import { MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from '@/components/locale-switcher';
import { SearchBar } from '@/components/shop/search-bar';
import { AccountMenu } from '@/components/shop/account-menu';
import { CartLink } from '@/components/shop/cart-link';
import { NotificationsBell } from '@/components/shop/notifications-bell';

export async function Header() {
  const t = await getTranslations('Nav');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-brand">
            ERENLER
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Market
          </span>
        </Link>

        <SearchBar />

        <nav className="flex items-center gap-1.5">
          <LocaleSwitcher />
          <Link
            href="/messages"
            aria-label={t('messages')}
            title={t('messages')}
            className="rounded-lg p-2 text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            <MessageCircle className="size-5" />
          </Link>
          <NotificationsBell />
          <CartLink />
          <AccountMenu />
        </nav>
      </div>
    </header>
  );
}
