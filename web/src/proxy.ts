import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Next.js 16: "middleware" -> "proxy". next-intl'in locale yönlendirmesi burada.
export default createMiddleware(routing);

export const config = {
  // API, statik dosyalar ve Next iç yolları hariç her şey
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
