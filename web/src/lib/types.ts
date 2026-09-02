// Backend yanıt tipleri. Çevrilebilir alanlar (name, description, title, content,
// tagline) storefront GET'lerinde ?lang ile tek dile çözülmüş string olarak gelir.

export interface Paginated<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  sku: string;
  description: string | null;
  price: string;
  original_price: string | null;
  is_new_arrival: boolean;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_images: ProductImage[];
}

export interface Category {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
}

export interface Announcement {
  id: string;
  author_id: string;
  title: string | null;
  content: string;
  image_url: string | null;
  created_at: string;
}

export interface StoreProfile {
  id: string;
  name: string;
  city: string | null;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  phone: string | null;
  address: string | null;
  working_hours: Record<string, unknown> | null;
}
