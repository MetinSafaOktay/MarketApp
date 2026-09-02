import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function Footer() {
  const t = await getTranslations('Footer');

  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-8 text-sm text-text-muted">
        <Link href="/about" className="hover:text-text">
          {t('about')}
        </Link>
        <Link href="/contact" className="hover:text-text">
          {t('contact')}
        </Link>
        <Link href="/terms" className="hover:text-text">
          {t('terms')}
        </Link>
        <Link href="/privacy" className="hover:text-text">
          {t('privacy')}
        </Link>
        <span className="ml-auto">
          © {new Date().getFullYear()} Erenler Market
        </span>
      </div>
    </footer>
  );
}
