import type { Locale } from '@/i18n/routing';

export type TranslatedText = Partial<Record<Locale, string>>;

export interface AdminStats {
  orders: { total: number; active: number; today: number };
  revenue: { all_time: number; last_7_days: number };
  customers: { total: number; new_today: number };
  products: { total: number; out_of_stock: number; low_stock: number };
  messaging: { unread_conversations: number };
}

export interface AdminProduct {
  id: string;
  category_id: string;
  name: TranslatedText;
  sku: string;
  description: TranslatedText | null;
  price: string;
  original_price: string | null;
  is_new_arrival: boolean;
  stock_quantity: number;
  is_active: boolean;
  product_images: { id: string; image_url: string; display_order: number }[];
}

export interface AdminCategory {
  id: string;
  name: TranslatedText;
  image_url: string | null;
  display_order: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: string;
  min_order_amount: string;
  usage_limit_per_user: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface AdminAnnouncement {
  id: string;
  title: TranslatedText | null;
  content: TranslatedText;
  image_url: string | null;
  created_at: string;
}

export interface AdminStoreProfile {
  id: string;
  name: string;
  city: string | null;
  tagline: TranslatedText | null;
  description: TranslatedText | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  address: string | null;
  working_hours: Record<string, unknown> | null;
  latitude: number | null;
  longitude: number | null;
  delivery_radius_km: number | null;
}

export interface AdminCustomer {
  id: string;
  profile_name: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  last_active_at: string | null;
  order_count: number;
}
