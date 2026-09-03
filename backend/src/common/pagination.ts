/**
 * Sayfalı liste yardımcıları. Liste servisleri (`products`, `orders` vb.)
 * `{ data: [...], meta: { total, page, pageSize, totalPages } }` biçiminde döner;
 * istemciler bu meta'ya göre "sonraki sayfa var mı" karar verir.
 */
export interface PaginationMeta {
  total: number; // filtreyle eşleşen toplam kayıt
  page: number; // 1-tabanlı geçerli sayfa
  pageSize: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

/** page/pageSize'ı Prisma'nın skip/take'ine çevirir; sınırları da güvenceye alır. */
export function toSkipTake(page = 1, pageSize = 20) {
  const safePage = Math.max(1, Math.floor(page)); // negatif/0/ondalık → en az 1
  const safeSize = Math.min(100, Math.max(1, Math.floor(pageSize))); // 1..100 aralığına kıstır
  return {
    skip: (safePage - 1) * safeSize, // atlanacak kayıt sayısı
    take: safeSize, // alınacak kayıt sayısı
    page: safePage,
    pageSize: safeSize,
  };
}

export function paginate<T>(
  data: T[],
  total: number,
  page: number,
  pageSize: number,
): Paginated<T> {
  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}
