-- Çok dilli içerik (B7)
-- Çevrilebilir metin alanları TEXT/VARCHAR -> JSONB'ye taşınır.
-- Biçim: {"tr": "...", "en": "...", ...}  — TR anahtarı zorunlu (uygulama katmanında),
-- eksik diller storefront'ta TR'ye düşer. Desteklenen diller: tr, en, de, fr, ar, nl.
-- Mevcut değerler {"tr": <eski değer>} olarak korunur (veri kaybı yok).

-- ===== products =====
ALTER TABLE products
  ALTER COLUMN name TYPE jsonb USING jsonb_build_object('tr', name);

ALTER TABLE products
  ALTER COLUMN description TYPE jsonb
  USING CASE
    WHEN description IS NULL OR description = '' THEN NULL
    ELSE jsonb_build_object('tr', description)
  END;

-- ===== categories =====
ALTER TABLE categories
  ALTER COLUMN name TYPE jsonb USING jsonb_build_object('tr', name);

-- ===== announcements =====
ALTER TABLE announcements
  ALTER COLUMN title TYPE jsonb
  USING CASE
    WHEN title IS NULL OR title = '' THEN NULL
    ELSE jsonb_build_object('tr', title)
  END;

ALTER TABLE announcements
  ALTER COLUMN content TYPE jsonb USING jsonb_build_object('tr', content);

-- ===== store_profile =====
ALTER TABLE store_profile
  ALTER COLUMN tagline TYPE jsonb
  USING CASE
    WHEN tagline IS NULL OR tagline = '' THEN NULL
    ELSE jsonb_build_object('tr', tagline)
  END;

ALTER TABLE store_profile
  ALTER COLUMN description TYPE jsonb
  USING CASE
    WHEN description IS NULL OR description = '' THEN NULL
    ELSE jsonb_build_object('tr', description)
  END;
