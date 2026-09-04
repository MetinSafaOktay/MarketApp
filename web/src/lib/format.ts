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

interface AddressLike {
  full_address: string;
  city: string;
  district: string;
  building_name?: string;
  building_no?: string;
  floor?: string;
  apartment_no?: string;
}

/** Tek satırlık teslimat adresi (bina/kat/daire dahil). */
export function formatAddress(a: AddressLike): string {
  const detail = [
    a.building_name && a.building_name,
    a.building_no && `No ${a.building_no}`,
    a.floor && `Kat ${a.floor}`,
    a.apartment_no && `Daire ${a.apartment_no}`,
  ]
    .filter(Boolean)
    .join(', ');
  return [a.full_address, detail, `${a.district}/${a.city}`]
    .filter(Boolean)
    .join(' · ');
}

export function isDiscounted(
  price: string | number,
  originalPrice: string | number | null,
): boolean {
  if (originalPrice == null) return false;
  return Number(originalPrice) > Number(price);
}
