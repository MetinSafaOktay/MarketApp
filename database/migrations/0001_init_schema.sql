-- MarketApp initial schema
-- Tek market (single-tenant), UUID primary key stratejisi

-- ===== ENUM TİPLERİ =====
CREATE TYPE order_status AS ENUM
  ('pending','confirmed','preparing','out_for_delivery','delivered','cancelled');
CREATE TYPE payment_method AS ENUM ('cash_on_delivery','card');
CREATE TYPE discount_type AS ENUM ('percentage','fixed');
CREATE TYPE sender_type AS ENUM ('user','store');
CREATE TYPE user_role AS ENUM ('customer','admin');

-- ===== 1. KULLANICI & HESAP =====
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             VARCHAR(255) UNIQUE,
  phone             VARCHAR(20)  UNIQUE,
  password_hash     VARCHAR(255) NOT NULL,
  profile_name      VARCHAR(30)  NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  last_name         VARCHAR(100) NOT NULL,
  profile_photo_url TEXT,
  bio               TEXT,
  is_private        BOOLEAN NOT NULL DEFAULT false,
  last_active_at    TIMESTAMPTZ,
  role              user_role NOT NULL DEFAULT 'customer',
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE follows (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE TABLE addresses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        VARCHAR(50) NOT NULL,
  full_address TEXT NOT NULL,
  city         VARCHAR(100) NOT NULL,
  district     VARCHAR(100) NOT NULL,
  is_default   BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE user_settings (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  language                     VARCHAR(10) NOT NULL DEFAULT 'tr',
  theme                        VARCHAR(10) NOT NULL DEFAULT 'dark',
  push_notifications_enabled   BOOLEAN NOT NULL DEFAULT true,
  order_notifications_enabled  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE push_subscriptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  endpoint    TEXT NOT NULL UNIQUE,
  p256dh_key  TEXT NOT NULL,
  auth_key    TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== 2. MARKET BİLGİSİ (tek satır, "Genel Bilgiler") =====
CREATE TABLE store_profile (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(150) NOT NULL,
  city             VARCHAR(100),
  tagline          VARCHAR(255),
  description      TEXT,
  logo_url         TEXT,
  cover_image_url  TEXT,
  phone            VARCHAR(20),
  address          TEXT,
  working_hours    JSONB
);

-- ===== 3. KATALOG =====
CREATE TABLE categories (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           VARCHAR(100) NOT NULL,
  image_url      TEXT,
  display_order  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id     UUID NOT NULL REFERENCES categories(id),
  name            VARCHAR(255) NOT NULL,
  sku             VARCHAR(50) UNIQUE NOT NULL,
  description     TEXT,
  price           NUMERIC(10,2) NOT NULL,
  original_price  NUMERIC(10,2),
  is_new_arrival  BOOLEAN NOT NULL DEFAULT false,
  stock_quantity  INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_images (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url      TEXT NOT NULL,
  display_order  INTEGER NOT NULL DEFAULT 0
);

-- ===== 4. ALIŞVERİŞ AKIŞI =====
CREATE TABLE cart_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE wishlist_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES products(id),
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

CREATE TABLE coupons (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code                   VARCHAR(50) UNIQUE NOT NULL,
  discount_type          discount_type NOT NULL,
  discount_value         NUMERIC(10,2) NOT NULL,
  min_order_amount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  usage_limit_per_user   INTEGER NOT NULL DEFAULT 1,
  valid_from             TIMESTAMPTZ,
  valid_until            TIMESTAMPTZ,
  is_active              BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users(id),
  address_id       UUID NOT NULL REFERENCES addresses(id),
  status           order_status NOT NULL DEFAULT 'pending',
  payment_method   payment_method NOT NULL DEFAULT 'cash_on_delivery',
  subtotal         NUMERIC(10,2) NOT NULL,
  discount_amount  NUMERIC(10,2) NOT NULL DEFAULT 0,
  coupon_id        UUID REFERENCES coupons(id),
  total_amount     NUMERIC(10,2) NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id              UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id            UUID NOT NULL REFERENCES products(id),
  quantity              INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_snapshot   NUMERIC(10,2) NOT NULL,
  subtotal              NUMERIC(10,2) NOT NULL
);

CREATE TABLE order_status_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      order_status NOT NULL,
  changed_by  UUID REFERENCES users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== 5. ETKİLEŞİM =====
CREATE TABLE announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id   UUID NOT NULL REFERENCES users(id),
  title       VARCHAR(255),
  content     TEXT NOT NULL,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type      sender_type NOT NULL,
  content          TEXT NOT NULL,
  is_read          BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type              VARCHAR(50) NOT NULL,
  title             VARCHAR(255) NOT NULL,
  body              TEXT,
  is_read           BOOLEAN NOT NULL DEFAULT false,
  related_order_id  UUID REFERENCES orders(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===== İNDEKSLER (sık sorgulanan foreign key'ler) =====
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_wishlist_items_user_id ON wishlist_items(user_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
