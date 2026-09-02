import { defineRouting } from 'next-intl/routing';

export const locales = ['tr', 'en', 'de', 'fr', 'ar', 'nl'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'tr';

export const routing = defineRouting({
  locales,
  defaultLocale,
  // tr köksüz (/), diğerleri önekli (/en, /de ...)
  localePrefix: 'as-needed',
});
