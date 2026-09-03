/**
 * i18n çekirdeği. Projede iki i18n katmanı var:
 *  1) Arayüz metinleri  → istemcide (web `messages/*.json`, mobil `strings.xml` vb.)
 *  2) İÇERİK (ürün adı, kategori, duyuru, mağaza sloganı) → DB'de jsonb map:
 *     { "tr": "...", "en": "..." }. Bu dosya (2)'yi yönetir.
 * Storefront GET'leri `?lang=xx` / Accept-Language'e göre tek dile çözer,
 * çeviri yoksa `tr`'ye düşer. Admin GET'leri ham map'i alır (?raw=true).
 */
export const SUPPORTED_LOCALES = ['tr', 'en', 'de', 'fr', 'ar', 'nl'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'tr';

/** Çevrilebilir metin: dil kodu -> metin. TR anahtarı zorunludur (uygulama kuralı). */
export type TranslatedText = Partial<Record<Locale, string>>;

export function isSupportedLocale(value: unknown): value is Locale {
  return (
    typeof value === 'string' &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

/** `?lang=` / `Accept-Language` girdisini desteklenen bir dile normalize eder. */
export function resolveLocale(input?: string | null): Locale {
  if (!input) return DEFAULT_LOCALE;
  const first = input.split(',')[0]?.trim().toLowerCase() ?? '';
  const base = first.split('-')[0];
  return isSupportedLocale(base) ? base : DEFAULT_LOCALE;
}

/** Accept-Language başlığından q-değerlerine göre en uygun dili seçer. */
export function parseAcceptLanguage(header?: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
      return {
        tag: tag.trim().toLowerCase().split('-')[0],
        q: q ? Number(q.slice(2)) || 0 : 1,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    if (isSupportedLocale(tag)) return tag;
  }
  return DEFAULT_LOCALE;
}

/**
 * Çevrilebilir metinden istenen dili çıkarır; yoksa TR'ye, o da yoksa ilk
 * dolu değere düşer. Eski düz string verileri de tolere eder.
 */
export function pickTranslation(value: unknown, locale: Locale): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value !== 'object') return '';

  const map = value as Record<string, unknown>;
  const candidates = [map[locale], map[DEFAULT_LOCALE]];
  for (const c of candidates) {
    if (typeof c === 'string' && c.length > 0) return c;
  }
  for (const c of Object.values(map)) {
    if (typeof c === 'string' && c.length > 0) return c;
  }
  return '';
}
