const CURRENCY = 'TRY';

/** "95" | 95 -> "₺95,00" (locale'e göre). */
export function formatPrice(value: string | number, locale: string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: CURRENCY,
    maximumFractionDigits: 2,
  }).format(n);
}

export function isDiscounted(
  price: string | number,
  originalPrice: string | number | null,
): boolean {
  if (originalPrice == null) return false;
  return Number(originalPrice) > Number(price);
}
