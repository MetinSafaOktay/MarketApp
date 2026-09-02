'use client';

import { useLocale } from 'next-intl';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { CartItem } from './types';

const CART_KEY = ['cart'];

export function useCart() {
  const locale = useLocale();
  const isAuthenticated = useIsAuthenticated();

  return useQuery({
    queryKey: CART_KEY,
    queryFn: () => authedApi<CartItem[]>('/cart', { locale }),
    enabled: isAuthenticated,
    staleTime: 15_000,
  });
}

export function useCartCount(): number {
  const { data } = useCart();
  return (data ?? []).reduce((n, item) => n + item.quantity, 0);
}

export function useAddToCart() {
  const qc = useQueryClient();
  const locale = useLocale();
  return useMutation({
    mutationFn: (input: { product_id: string; quantity?: number }) =>
      authedApi('/cart/items', {
        method: 'POST',
        locale,
        body: JSON.stringify({ quantity: 1, ...input }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useUpdateCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) =>
      authedApi(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useRemoveCartItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      authedApi(`/cart/items/${productId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}

export function useClearCart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authedApi('/cart', { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: CART_KEY }),
  });
}
