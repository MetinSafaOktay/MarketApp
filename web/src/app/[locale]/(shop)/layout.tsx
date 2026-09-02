import { setRequestLocale } from 'next-intl/server';
import { Header } from '@/components/shop/header';
import { Footer } from '@/components/shop/footer';

export default async function ShopLayout({
  children,
  params,
}: LayoutProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
