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

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  added_at: string;
  products: Product;
}

export interface WishlistItem {
  id: string;
  product_id: string;
  added_at: string;
  products: Product;
}

export interface Address {
  id: string;
  label: string;
  full_address: string;
  city: string;
  district: string;
  building_name: string;
  building_no: string;
  floor: string;
  apartment_no: string;
  is_default: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price_snapshot: string;
  subtotal: string;
  products: Product;
}

export interface OrderStatusHistory {
  id: string;
  status: OrderStatus;
  note: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  status: OrderStatus;
  payment_method: 'cash_on_delivery' | 'card';
  subtotal: string;
  discount_amount: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  order_status_history: OrderStatusHistory[];
  addresses: Address;
}

export interface CheckoutPreview {
  items: {
    product_id: string;
    name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    in_stock: boolean;
    stock_quantity: number;
  }[];
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon: {
    code: string;
    discount_type: string;
    discount_value: number;
  } | null;
  coupon_error: string | null;
  has_stock_issues: boolean;
  delivery_area_ok: boolean;
  delivery_area_error: string | null;
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
  latitude: number | null;
  longitude: number | null;
  delivery_radius_km: number | null;
}
