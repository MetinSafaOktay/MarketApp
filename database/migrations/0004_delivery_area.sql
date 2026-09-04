-- Teslimat bölgesi (kuş uçuşu yarıçap)
-- store_profile: mağazanın konumu + teslimat yarıçapı (km).
-- addresses: müşteri adresinin konumu (haritadan pin ile gelir; eski adreslerde NULL).
-- Üç store alanından biri bile NULL ise / yarıçap <= 0 ise kısıt KAPALI (opt-in).
-- Mesafe kontrolü uygulama katmanında (haversine); burada sadece kolonlar.

ALTER TABLE store_profile
  ADD COLUMN latitude           double precision,
  ADD COLUMN longitude          double precision,
  ADD COLUMN delivery_radius_km double precision;

ALTER TABLE addresses
  ADD COLUMN latitude  double precision,
  ADD COLUMN longitude double precision;
