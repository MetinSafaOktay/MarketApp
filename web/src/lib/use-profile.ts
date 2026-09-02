'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi, type AuthUser } from './auth';
import { clearTokens } from './client-api';
import { useIsAuthenticated } from './use-auth';

export interface UserSettings {
  language: string;
  theme: string;
  push_notifications_enabled: boolean;
  order_notifications_enabled: boolean;
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<AuthUser>) =>
      authedApi<AuthUser>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth', 'me'] }),
  });
}

export function useUserSettings() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['user-settings'],
    queryFn: () => authedApi<UserSettings>('/users/me/settings'),
    enabled: isAuthenticated,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<UserSettings>) =>
      authedApi<UserSettings>('/users/me/settings', {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: (data) => qc.setQueryData(['user-settings'], data),
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => authedApi('/users/me', { method: 'DELETE' }),
    onSuccess: () => {
      clearTokens();
      qc.clear();
    },
  });
}
