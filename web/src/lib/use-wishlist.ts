'use client';

import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { WishlistItem } from './types';

const KEY = ['wishlist'];

export function useWishlist() {
  const locale = useLocale();
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: () => authedApi<WishlistItem[]>('/wishlist', { locale }),
    enabled: isAuthenticated,
  });
}

export function useToggleWishlist() {
  const qc = useQueryClient();
  const { data } = useWishlist();

  const add = useMutation({
    mutationFn: (productId: string) =>
      authedApi('/wishlist/items', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (productId: string) =>
      authedApi(`/wishlist/items/${productId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  function isSaved(productId: string) {
    return (data ?? []).some((i) => i.product_id === productId);
  }

  function toggle(productId: string) {
    if (isSaved(productId)) remove.mutate(productId);
    else add.mutate(productId);
  }

  return { isSaved, toggle, pending: add.isPending || remove.isPending };
}
