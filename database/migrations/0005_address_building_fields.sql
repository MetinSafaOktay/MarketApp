-- Adres detayları: bina adı / bina no / kat / daire no.
-- Kullanıcı elle girer (haritadan otomatik dolmaz), kaydetmek için zorunludur.
-- Zorunluluk uygulama katmanında (DTO doğrulaması); kolonlar boş string default
-- ile NOT NULL — mevcut satırları kırmadan eklenir.

ALTER TABLE addresses
  ADD COLUMN building_name text NOT NULL DEFAULT '',
  ADD COLUMN building_no   text NOT NULL DEFAULT '',
  ADD COLUMN floor         text NOT NULL DEFAULT '',
  ADD COLUMN apartment_no  text NOT NULL DEFAULT '';
