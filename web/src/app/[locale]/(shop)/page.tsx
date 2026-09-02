import { getTranslations, setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { apiFetch } from '@/lib/api';
import type { Announcement, Paginated, Product, StoreProfile } from '@/lib/types';
import { CategorySidebar } from '@/components/shop/category-sidebar';
import { ProductCard } from '@/components/shop/product-card';

export default async function HomePage({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const tc = await getTranslations('Common');

  const [store, announcements, discounted, newArrivals, latest] =
    await Promise.all([
      apiFetch<StoreProfile>('/store', { locale }).catch(() => null),
      apiFetch<Announcement[]>('/announcements', { locale }).catch(() => []),
      apiFetch<Paginated<Product>>('/products', {
        locale,
        params: { pageSize: 8, onlyDiscounted: true },
      }).catch(() => null),
      apiFetch<Paginated<Product>>('/products', {
        locale,
        params: { pageSize: 8, onlyNew: true },
      }).catch(() => null),
      apiFetch<Paginated<Product>>('/products', {
        locale,
        params: { pageSize: 8 },
      }).catch(() => null),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <Hero
        store={store}
        tCta={t('orderNow')}
        tInfo={t('generalInfo')}
        tagline={t('tagline')}
      />

      {announcements.length > 0 && (
        <section className="mt-6 space-y-3">
          {announcements.slice(0, 2).map((a) => (
            <AnnouncementCard
              key={a.id}
              announcement={a}
              couponLabel={t('couponCode')}
            />
          ))}
        </section>
      )}

      <div className="mt-8 flex gap-6">
        <CategorySidebar />
        <div className="min-w-0 flex-1 space-y-10">
          <Rail
            title={t('discountedProducts')}
            viewAll={tc('viewAll')}
            href="/products?onlyDiscounted=true"
            products={discounted?.data ?? []}
          />
          <Rail
            title={t('newProducts')}
            viewAll={tc('viewAll')}
            href="/products?onlyNew=true"
            products={newArrivals?.data ?? []}
          />
          {(discounted?.data.length ?? 0) === 0 &&
            (newArrivals?.data.length ?? 0) === 0 && (
              <Rail
                title={t('discountedProducts')}
                viewAll={tc('viewAll')}
                href="/products"
                products={latest?.data ?? []}
                hideWhenEmpty={false}
              />
            )}
        </div>
      </div>
    </div>
  );
}

function Rail({
  title,
  viewAll,
  href,
  products,
  hideWhenEmpty = true,
}: {
  title: string;
  viewAll: string;
  href: string;
  products: Product[];
  hideWhenEmpty?: boolean;
}) {
  if (products.length === 0 && hideWhenEmpty) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Link
          href={href}
          className="text-sm font-medium text-accent hover:underline"
        >
          {viewAll}
        </Link>
      </div>
      {products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <EmptyProducts />
      )}
    </section>
  );
}

function Hero({
  store,
  tagline,
  tCta,
  tInfo,
}: {
  store: StoreProfile | null;
  tagline: string;
  tCta: string;
  tInfo: string;
}) {
  const name = store?.name ?? 'Erenler Market';
  const city = store?.city ?? 'Afyonkarahisar';

  return (
    <section className="relative mt-4 overflow-hidden rounded-card border border-border">
      {store?.cover_image_url && (
        <Image
          src={store.cover_image_url}
          alt=""
          width={1400}
          height={400}
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      )}
      <div className="relative flex flex-col gap-3 bg-gradient-to-r from-surface via-surface/90 to-surface/40 p-8">
        <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl" dir="auto">
          {name} — {city}
        </h1>
        <p className="text-text-muted" dir="auto">
          {store?.tagline ?? tagline}
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg hover:bg-accent-hover"
          >
            {tCta}
          </Link>
          <Link
            href="/about"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-surface-2"
          >
            {tInfo}
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function AnnouncementCard({
  announcement,
  couponLabel,
}: {
  announcement: Announcement;
  couponLabel: string;
}) {
  const coupon = extractCoupon(announcement.content);
  return (
    <article className="rounded-card border border-border bg-surface p-4">
      {announcement.title && (
        <h3 className="mb-1 font-semibold" dir="auto">
          {announcement.title}
        </h3>
      )}
      <p className="whitespace-pre-line text-sm text-text-muted" dir="auto">
        {announcement.content}
      </p>
      {coupon && (
        <p className="mt-2 text-sm">
          <span className="font-semibold">{couponLabel}: </span>
          <code className="rounded bg-surface-2 px-1.5 py-0.5 text-accent">
            {coupon}
          </code>
        </p>
      )}
    </article>
  );
}

function extractCoupon(text: string): string | null {
  const m = text.match(/([A-Z]{2,}[A-Z0-9]*\d[A-Z0-9]*)/);
  return m ? m[1] : null;
}

async function EmptyProducts() {
  const t = await getTranslations('Common');
  return (
    <div className="rounded-card border border-dashed border-border p-12 text-center text-sm text-text-muted">
      {t('empty')}
    </div>
  );
}
