# Erenler Market

Afyonkarahisar'daki Erenler Market için online sipariş sistemi — tek market, çok
dilli (6 dil). Monorepo yapısında beş bileşen içerir.

> Bu sürüm Erenler Market'e özeldir. Marka adı, içerik ve mağaza bilgisi
> yapılandırma/veritabanı ile yönetilir; ileride başka marketlere uyarlanabilir.

| Klasör | Amaç | Stack |
|---|---|---|
| [`backend/`](backend/) | API sunucusu | Node.js + TypeScript (NestJS) |
| [`database/`](database/) | Şema, migration, seed | PostgreSQL |
| [`web/`](web/) | Web uygulaması (storefront + /admin) | Next.js 16 + TypeScript + Tailwind |
| [`mobile-android/`](mobile-android/) | Android uygulaması | Kotlin + Jetpack Compose |
| [`mobile-ios/`](mobile-ios/) | iOS uygulaması | Swift + SwiftUI |

Mimari detaylar için [docs/architecture.md](docs/architecture.md).

## Durum

| Bileşen | Durum |
|---|---|
| `backend/` | Tamam — 16 modül, JWT auth, çok dilli içerik, Vercel'de canlı |
| `database/` | Tamam — 20 tablo, 3 migration; prod: Supabase |
| `web/` | Tamam (v1) — storefront + hesap + sepet/sipariş + mesajlaşma + admin paneli + 6 dil + tema; Vercel'de canlı |
| `mobile-ios/` | Tamam (v1) — M1–M6: katalog, auth, sepet/ödeme/sipariş, mesaj/bildirim/ayarlar, çevrimdışı cache |
| `mobile-android/` | Tamam (v1) — A1–A6: iskelet, katalog, auth, ticaret, mesaj/ayarlar, Room/çevrimdışı |

Mimari kararlar ve gerekçeleri: [docs/architecture.md](docs/architecture.md).
Veritabanı şeması: [docs/er-diagram.md](docs/er-diagram.md).
API sözleşmesi: [docs/api-spec.yaml](docs/api-spec.yaml) (`GET /api` — Swagger UI).

## Geliştirme

Her alt klasördeki `.env.example` dosyasını `.env` (web'de `.env.local`) olarak
kopyalayıp değerleri girin. Gerçek secret'lar asla commit edilmez.

```bash
# backend
cd backend && npm install && npm run start:dev        # :3000

# web
cd web && npm install && npm run dev                   # :3001
```
