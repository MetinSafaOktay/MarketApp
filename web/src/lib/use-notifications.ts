'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  related_order_id: string | null;
  created_at: string;
}

const KEY = ['notifications'];

export function useNotifications() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: () => authedApi<AppNotification[]>('/notifications/me'),
    enabled: isAuthenticated,
    refetchInterval: 30_000,
  });
}

export function useUnreadNotificationCount(): number {
  const { data } = useNotifications();
  return (data ?? []).filter((n) => !n.is_read).length;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      authedApi(`/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      authedApi('/notifications/me/read-all', { method: 'PATCH' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
