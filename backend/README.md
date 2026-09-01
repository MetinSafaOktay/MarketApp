# Backend (Node.js + TypeScript / NestJS)

NestJS + Prisma (driver adapter: `@prisma/adapter-pg`) + PostgreSQL. Şema kaynağı: [`database/migrations/`](../database/migrations/).

## Kurulum
1. `cp .env.example .env` ve `DATABASE_URL`/`JWT_SECRET`/`PORT` değerlerini doldur (local için `../database/migrations/`'daki tüm dosyaların uygulandığı bir PostgreSQL veritabanı gerekir)
2. Web push için `npx web-push generate-vapid-keys` ile üretip `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`'i doldur (opsiyonel — boşsa push bildirimleri sessizce devre dışı kalır)
3. Görsel yükleme için `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`SUPABASE_STORAGE_BUCKET`'i doldur (opsiyonel — boşsa `/uploads/*` 503 döner)
4. `npm install`
5. `npx prisma generate` (şema değiştiyse önce `npx prisma db pull`)
6. `npm run start:dev`

## Faydalı komutlar
| Komut | Amaç |
|---|---|
| `npm run start:dev` | Watch modunda geliştirme sunucusu |
| `npm run lint` | ESLint + Prettier |
| `npm test` | Unit testler |
| `npm run test:e2e` | E2E testler |
| `npm run export:openapi` | Çalışan sunucudan `docs/api-spec.yaml`'ı günceller |
| `npx prisma studio` | Veritabanını görsel olarak incele |

## Modüller
`auth`, `users`, `addresses`, `user-settings`, `store`, `catalog` (categories/products), `cart`, `wishlist`, `coupons`, `orders`, `announcements`, `messaging` (conversations), `notifications`, `push`, `admin` (dashboard/istatistik), `storage` (`/uploads/*` — Supabase Storage imzalı upload URL'leri). Tam endpoint listesi: `GET /api` (Swagger UI) veya [`docs/api-spec.yaml`](../docs/api-spec.yaml).

Katalog listesi (`GET /products`) arama (`q`), sıralama (`sort`), sayfalama (`page`/`pageSize`) ve filtre (`onlyDiscounted`/`onlyNew`/`inStock`/`categoryId`) parametreleri alır; yanıt `{ data, meta }` biçimindedir.

- `GET /` — health/hello
- `GET /health` — DB bağlantısını doğrular
