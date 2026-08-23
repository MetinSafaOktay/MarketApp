# Veritabanı Şeması

Tek market (single-tenant) mimarisi, tüm primary key'ler `UUID` (tahmin edilebilir sıralı ID riskini önlemek için).
Kaynak: [`database/migrations/`](../database/migrations/) (`0001_init_schema.sql` + `0002_refresh_tokens.sql`)

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
- **categories**
- **products** — `sku`, `price`/`original_price` (indirim), `is_new_arrival`, `stock_quantity`
- **product_images**

## Alışveriş Akışı
- **cart_items**
- **wishlist_items** — "İstek listesi"
- **coupons** — kod, indirim tipi/değeri, kullanım limiti
- **orders** — durum, ödeme yöntemi (`cash_on_delivery`/`card`), kupon
- **order_items** — sipariş anındaki fiyat snapshot'ı
- **order_status_history** — durum değişikliği denetimi + müşteri sipariş takibi

## Etkileşim
- **announcements** — ana sayfa duyuru/kupon postları
- **conversations** / **messages** — Gelen Kutusu
- **notifications** — uygulama içi bildirimler

## Sonraki adımlar (production notu)
- Local geliştirme: Homebrew PostgreSQL (`marketapp` veritabanı) kullanılıyor.
- Vercel'e deploy edilirken serverless fonksiyonlar local veritabanına erişemeyeceği için Neon/Supabase gibi bulut PostgreSQL sağlayıcısına geçilecek.
- Gerçek zamanlı mesajlaşma (Gelen Kutusu) Vercel serverless'ta WebSocket desteklemediği için polling veya üçüncü parti realtime servisiyle çözülecek (backend planlaması sırasında netleşecek).
