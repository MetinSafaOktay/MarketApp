'use client';

import { useLocale } from 'next-intl';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { Order } from './types';

export function useOrders() {
  const locale = useLocale();
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['orders'],
    queryFn: () => authedApi<Order[]>('/orders', { locale }),
    enabled: isAuthenticated,
  });
}

export function useOrder(id: string) {
  const locale = useLocale();
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => authedApi<Order>(`/orders/${id}`, { locale }),
    enabled: isAuthenticated && !!id,
  });
}

export function useCancelOrder(id: string) {
  const qc = useQueryClient();
  const locale = useLocale();
  return useMutation({
    mutationFn: () =>
      authedApi<Order>(`/orders/${id}/cancel`, {
        method: 'PATCH',
        locale,
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}
