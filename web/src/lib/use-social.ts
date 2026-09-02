'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from './api';
import { authedApi } from './auth';

export interface PublicProfile {
  id: string;
  profile_name: string;
  first_name: string;
  last_name: string;
  profile_photo_url: string | null;
  bio: string | null;
  is_private: boolean;
  last_active_at: string | null;
  created_at: string;
  followerCount: number;
  followingCount: number;
}

export function usePublicProfile(id: string) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => apiFetch<PublicProfile>(`/users/${id}`, { revalidate: 30 }),
    enabled: !!id,
    retry: false,
  });
}

export function useFollow(id: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['profile', id] });
  return {
    follow: useMutation({
      mutationFn: () => authedApi(`/users/${id}/follow`, { method: 'POST' }),
      onSuccess: invalidate,
    }),
    unfollow: useMutation({
      mutationFn: () => authedApi(`/users/${id}/follow`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  };
}
