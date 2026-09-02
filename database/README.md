# Database (PostgreSQL)

> İskelet aşamasında. Şema ve migration yapısı ayrı bir planlama turunda kurulacak.

- `migrations/` — şema değişiklikleri
- `seeds/fake-data/` — local development ve public showcase için sahte veri (gerçek müşteri verisi asla burada bulunmaz)
  - `catalog.sql` — 7 kategori + 31 ürün + görseller + duyurular (idempotent; local ve prod'da çalışır)
  - `generate.py` — `catalog.sql`'i yeniden üretir
