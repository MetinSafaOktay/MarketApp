# Backend (Node.js + TypeScript / NestJS)

NestJS + Prisma (driver adapter: `@prisma/adapter-pg`) + PostgreSQL. Şema kaynağı: [`database/migrations/`](../database/migrations/).

## Kurulum
1. `cp .env.example .env` ve `DATABASE_URL`/`JWT_SECRET`/`PORT` değerlerini doldur (local için `../database/migrations/0001_init_schema.sql`'in uygulandığı bir PostgreSQL veritabanı gerekir)
2. `npm install`
3. `npx prisma generate` (şema değiştiyse önce `npx prisma db pull`)
4. `npm run start:dev`

## Faydalı komutlar
| Komut | Amaç |
|---|---|
| `npm run start:dev` | Watch modunda geliştirme sunucusu |
| `npm run lint` | ESLint + Prettier |
| `npm test` | Unit testler |
| `npm run test:e2e` | E2E testler |
| `npm run export:openapi` | Çalışan sunucudan `docs/api-spec.yaml`'ı günceller |
| `npx prisma studio` | Veritabanını görsel olarak incele |

## Uçlar (B1)
- `GET /` — health/hello
- `GET /health` — DB bağlantısını doğrular
- `GET /api` — Swagger UI
