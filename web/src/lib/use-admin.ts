'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { Paginated, Order } from './types';
import type {
  AdminAnnouncement,
  AdminCategory,
  AdminCoupon,
  AdminCustomer,
  AdminProduct,
  AdminStats,
  AdminStoreProfile,
} from './admin-types';

function useAdminQuery<T>(key: QueryKey, path: string, params?: Record<string, string>) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: key,
    queryFn: () => authedApi<T>(path, { params }),
    enabled: isAuthenticated,
  });
}

function useInvalidate(keys: QueryKey[]) {
  const qc = useQueryClient();
  return () => keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
}

/* ---------- Dashboard ---------- */
export function useAdminStats() {
  return useAdminQuery<AdminStats>(['admin', 'stats'], '/admin/stats');
}

/* ---------- Products ---------- */
const PRODUCTS_KEY = ['admin', 'products'];

export function useAdminProducts() {
  return useAdminQuery<Paginated<AdminProduct>>(PRODUCTS_KEY, '/products', {
    raw: 'true',
    pageSize: '100',
  });
}

export function useAdminProduct(id: string | undefined) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['admin', 'products', id],
    queryFn: () =>
      authedApi<AdminProduct>(`/products/${id}`, { params: { raw: 'true' } }),
    enabled: isAuthenticated && !!id,
  });
}

export function useProductMutations() {
  const invalidate = useInvalidate([PRODUCTS_KEY, ['admin', 'stats']]);
  return {
    create: useMutation({
      mutationFn: (body: unknown) =>
        authedApi<AdminProduct>('/products', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        authedApi<AdminProduct>(`/products/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) =>
        authedApi(`/products/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
    addImage: useMutation({
      mutationFn: ({ id, image_url }: { id: string; image_url: string }) =>
        authedApi(`/products/${id}/images`, {
          method: 'POST',
          body: JSON.stringify({ image_url }),
        }),
      onSuccess: invalidate,
    }),
    removeImage: useMutation({
      mutationFn: ({ id, imageId }: { id: string; imageId: string }) =>
        authedApi(`/products/${id}/images/${imageId}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  };
}

/* ---------- Categories ---------- */
const CATEGORIES_KEY = ['admin', 'categories'];

export function useAdminCategories() {
  return useAdminQuery<AdminCategory[]>(CATEGORIES_KEY, '/categories', {
    raw: 'true',
  });
}

export function useCategoryMutations() {
  const invalidate = useInvalidate([CATEGORIES_KEY, ['admin', 'products']]);
  return {
    create: useMutation({
      mutationFn: (body: unknown) =>
        authedApi('/categories', { method: 'POST', body: JSON.stringify(body) }),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        authedApi(`/categories/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) =>
        authedApi(`/categories/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  };
}

/* ---------- Coupons ---------- */
const COUPONS_KEY = ['admin', 'coupons'];

export function useAdminCoupons() {
  return useAdminQuery<AdminCoupon[]>(COUPONS_KEY, '/coupons');
}

export function useCouponMutations() {
  const invalidate = useInvalidate([COUPONS_KEY]);
  return {
    create: useMutation({
      mutationFn: (body: unknown) =>
        authedApi('/coupons', { method: 'POST', body: JSON.stringify(body) }),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        authedApi(`/coupons/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) =>
        authedApi(`/coupons/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  };
}

/* ---------- Announcements ---------- */
const ANNOUNCEMENTS_KEY = ['admin', 'announcements'];

export function useAdminAnnouncements() {
  return useAdminQuery<AdminAnnouncement[]>(ANNOUNCEMENTS_KEY, '/announcements', {
    raw: 'true',
  });
}

export function useAnnouncementMutations() {
  const invalidate = useInvalidate([ANNOUNCEMENTS_KEY]);
  return {
    create: useMutation({
      mutationFn: (body: unknown) =>
        authedApi('/announcements', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: unknown }) =>
        authedApi(`/announcements/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) =>
        authedApi(`/announcements/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  };
}

/* ---------- Orders (admin) ---------- */
export function useAdminOrders() {
  return useAdminQuery<Order[]>(['admin', 'orders'], '/orders');
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: string;
      note?: string;
    }) =>
      authedApi(`/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, note }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
  });
}

/* ---------- Store ---------- */
export function useAdminStore() {
  return useAdminQuery<AdminStoreProfile>(['admin', 'store'], '/store', {
    raw: 'true',
  });
}

export function useUpdateStore() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) =>
      authedApi('/store', { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'store'] });
      qc.invalidateQueries({ queryKey: ['store'] });
    },
  });
}

/* ---------- Customers ---------- */
export function useAdminCustomers(q?: string) {
  return useAdminQuery<Paginated<AdminCustomer>>(
    ['admin', 'customers', q ?? ''],
    '/admin/customers',
    { pageSize: '100', ...(q ? { q } : {}) },
  );
}
