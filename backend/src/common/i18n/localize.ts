/**
 * Prisma satırlarındaki çok dilli alanları tek dile "düzleştirmek" için yardımcılar.
 * Servisler storefront yanıtlarını döndürmeden önce
 * `localizeFields(product, locale, ['name','description'])` çağırır.
 */
import { Locale, pickTranslation } from './locales';

/**
 * Verilen alanları istenen dile çözer (yeni nesne döner).
 * null alanlar null kalır; düz string eski veriler de tolere edilir.
 */
export function localizeFields<T extends Record<string, unknown>>(
  obj: T,
  locale: Locale,
  fields: readonly string[],
): T {
  const out: Record<string, unknown> = { ...obj };
  for (const field of fields) {
    if (field in out) {
      out[field] =
        out[field] == null ? null : pickTranslation(out[field], locale);
    }
  }
  return out as T;
}

export function localizeList<T extends Record<string, unknown>>(
  items: T[],
  locale: Locale,
  fields: readonly string[],
): T[] {
  return items.map((item) => localizeFields(item, locale, fields));
}
