'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'store';
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  created_at: string;
  users?: { id: string; profile_name: string; profile_photo_url: string | null };
  /** GET /conversations listesinde son mesaj (take: 1). */
  messages?: Message[];
}

/** GET /conversations → tüm sohbetler (admin), her biri son mesajıyla. */
export function useConversations() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['admin', 'conversations'],
    queryFn: () => authedApi<Conversation[]>('/conversations'),
    enabled: isAuthenticated,
    refetchInterval: 15_000,
  });
}

/** GET /conversations/:id → o sohbetin düz Message[] dizisi (admin). */
export function useConversation(id: string | null) {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['admin', 'conversations', id],
    queryFn: () => authedApi<Message[]>(`/conversations/${id}`),
    enabled: isAuthenticated && !!id,
    refetchInterval: 10_000,
  });
}

export function useReplyToConversation(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      authedApi(`/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'conversations', id] });
      qc.invalidateQueries({ queryKey: ['admin', 'conversations'] });
    },
  });
}
