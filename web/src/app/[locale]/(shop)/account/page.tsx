import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Heart, MapPin, Package, Settings } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { RequireAuth } from '@/components/auth/require-auth';
import { AccountHeader } from '@/components/account/account-header';

export default async function AccountPage({
  params,
}: PageProps<'/[locale]/account'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  const links = [
    { href: '/orders', label: t('orders'), icon: <Package className="size-5" /> },
    { href: '/wishlist', label: t('wishlist'), icon: <Heart className="size-5" /> },
    {
      href: '/account/addresses',
      label: t('addresses'),
      icon: <MapPin className="size-5" />,
    },
    {
      href: '/account/settings',
      label: t('settings'),
      icon: <Settings className="size-5" />,
    },
  ];

  return (
    <RequireAuth>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <AccountHeader />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-3 rounded-card border border-border bg-surface p-4 text-sm font-medium hover:bg-surface-2"
            >
              <span className="text-accent">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </RequireAuth>
  );
}
