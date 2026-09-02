# Web (Next.js)

Erenler Market müşteri arayüzü (storefront) + `/admin` paneli. Backend API'sine
(`backend/`) HTTP ile bağlanır.

## Stack
- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS v4** — tema token'ları `src/app/globals.css` içinde (koyu tema öncelikli)
- **next-intl v4** — 6 dil (`tr` varsayılan, `en`, `de`, `fr`, `ar`, `nl`), `localePrefix: as-needed`
- **TanStack Query v5** — istemci tarafı veri
- **lucide-react** — ikonlar

## Kurulum
1. `cp .env.example .env.local` ve `NEXT_PUBLIC_API_BASE_URL`'i ayarla
   (deploy edilmiş backend ya da `http://localhost:3000` — backend'i lokal çalıştırıyorsan)
2. `npm install`
3. `npm run dev` → http://localhost:3001

| Komut | Amaç |
|---|---|
| `npm run dev` | Geliştirme sunucusu (port 3001) |
| `npm run build` | Prod build |
| `npm run lint` | ESLint |

## Yapı
```
src/
  app/[locale]/
    (shop)/         # storefront — header + kategori menüsü + footer
    admin/          # yönetim paneli — ayrı layout (ürün, kategori, sipariş,
                    #   kupon, duyuru, müşteri, mesaj, mağaza ayarları)
  components/
  i18n/             # routing, request config, navigation helper'ları
  lib/              # api client, tipler, formatlayıcılar
  messages/         # {locale}.json arayüz metinleri
  proxy.ts          # next-intl locale middleware (Next 16: "proxy")
```

## i18n notları
- Arayüz metinleri: `src/messages/*.json` — 6 dilin hepsi çevrili.
- İçerik (ürün adı vb.): backend `?lang=` ile tek dile çözer; `apiFetch` locale'i otomatik ekler.
- Tam RTL layout yok; Arapça metin blokları `dir="auto"` ile sağdan sola akar.

## Bilinen eksikler
- Otomatik test yok.
- Web push istemcisi yok (service worker + abonelik) — bildirimler polling ile gelir.
- `terms` / `privacy` sayfaları placeholder metin.
