# MarketApp

Market için online sipariş sistemi. Monorepo yapısında beş bileşen içerir:

| Klasör | Amaç | Stack |
|---|---|---|
| [`backend/`](backend/) | API sunucusu | Node.js + TypeScript (NestJS) |
| [`database/`](database/) | Şema, migration, seed | PostgreSQL |
| [`web/`](web/) | Web uygulaması (storefront + /admin) | Next.js 16 + TypeScript + Tailwind |
| [`mobile-android/`](mobile-android/) | Android uygulaması | Java |
| [`mobile-ios/`](mobile-ios/) | iOS uygulaması | Swift |

Mimari detaylar için [docs/architecture.md](docs/architecture.md).

## Durum

Proje iskelet aşamasında. Her bileşenin kurulumu ayrı planlama turlarında yapılacak.

## Geliştirme

Her alt klasördeki `.env.example` dosyasını `.env` olarak kopyalayıp kendi değerlerinizi girin. Gerçek secret'lar asla commit edilmez.
