'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart, LogOut, MapPin, Package, Settings, User } from 'lucide-react';
import { Link, useRouter } from '@/i18n/navigation';
import { useCurrentUser, useLogout } from '@/lib/use-auth';
import { cn } from '@/lib/cn';

export function AccountMenu() {
  const t = useTranslations('Account');
  const tn = useTranslations('Nav');
  const { user, isAuthenticated } = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <Link
        href="/login"
        className="rounded-lg px-3 py-2 text-sm font-medium text-text-muted hover:bg-surface-2 hover:text-text"
      >
        {tn('signIn')}
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        aria-label={t('title')}
        className={cn(
          'rounded-lg p-2 text-text-muted hover:bg-surface-2 hover:text-text',
          open && 'bg-surface-2 text-text',
        )}
      >
        <User className="size-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-52 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
          {user && (
            <div className="border-b border-border px-3 py-2.5">
              <p className="truncate text-sm font-medium" dir="auto">
                {user.profile_name}
              </p>
              {user.email && (
                <p className="truncate text-xs text-text-muted">{user.email}</p>
              )}
            </div>
          )}
          <MenuLink href="/account" icon={<User className="size-4" />}>
            {t('profile')}
          </MenuLink>
          <MenuLink href="/orders" icon={<Package className="size-4" />}>
            {t('orders')}
          </MenuLink>
          <MenuLink href="/wishlist" icon={<Heart className="size-4" />}>
            {t('wishlist')}
          </MenuLink>
          <MenuLink href="/account/addresses" icon={<MapPin className="size-4" />}>
            {t('addresses')}
          </MenuLink>
          <MenuLink href="/account/settings" icon={<Settings className="size-4" />}>
            {t('settings')}
          </MenuLink>
          <button
            type="button"
            onMouseDown={async () => {
              await logout();
              router.replace('/');
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-surface-2"
          >
            <LogOut className="size-4" />
            {tn('signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 text-sm text-text hover:bg-surface-2"
    >
      {icon}
      {children}
    </Link>
  );
}
