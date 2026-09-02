# Veritabanı Şeması

Tek market (single-tenant) mimarisi, tüm primary key'ler `UUID` (tahmin edilebilir sıralı ID riskini önlemek için).
Kaynak: [`database/migrations/`](../database/migrations/)
- `0001_init_schema.sql` — ilk şema (20 tablo)
- `0002_refresh_tokens.sql` — auth: hash'lenmiş refresh token'lar
- `0003_translatable_content.sql` — çevrilebilir alanları jsonb'ye taşır (ürün/kategori/duyuru/mağaza adı+açıklama)

## Kullanıcı & Hesap
- **users** — hesap, herkese açık `profile_name`, `role` (customer/admin), `is_private`, `last_active_at`
- **follows** — kullanıcılar arası takip (Takipçi/Takip Edilen)
- **addresses** — teslimat adresleri
- **user_settings** — dil, tema, bildirim tercihleri
- **push_subscriptions** — Web Push abonelikleri (admin sipariş bildirimi için)
- **refresh_tokens** — auth modülü: hash'lenmiş refresh token'lar, rotasyon + logout ile iptal desteği (B2'de eklendi)

## Market Bilgisi
- **store_profile** — tek satır, "Genel Bilgiler" ekranı (isim, şehir, açıklama, çalışma saatleri)

## Katalog
- **categories** — `name` jsonb (çok dilli), `image_url`, `display_order`
- **products** — `name`/`description` jsonb (çok dilli), `sku`, `price`/`original_price` (indirim), `is_new_arrival`, `stock_quantity`, `is_active`
- **product_images**

## Alışveriş Akışı
- **cart_items**
- **wishlist_items** — "İstek listesi"
- **coupons** — kod, indirim tipi/değeri, kullanım limiti
- **orders** — durum, ödeme yöntemi (`cash_on_delivery`/`card`), kupon
- **order_items** — sipariş anındaki fiyat snapshot'ı
- **order_status_history** — durum değişikliği denetimi + müşteri sipariş takibi

## Etkileşim
- **announcements** — ana sayfa duyuru/kupon postları (`title`/`content` jsonb)
- **conversations** / **messages** — müşteri ↔ mağaza sohbeti (`sender_type`)
- **notifications** — uygulama içi bildirimler (`related_order_id`)

## Production notu (uygulandı)
- Local: Homebrew PostgreSQL (`marketapp`). Prod: Supabase, transaction pooler + TLS.
- Mesajlaşma/bildirim: Vercel serverless'ta WebSocket olmadığı için **polling** ile çözüldü.
- Mimari kararların gerekçeleri: [`architecture.md`](architecture.md).
