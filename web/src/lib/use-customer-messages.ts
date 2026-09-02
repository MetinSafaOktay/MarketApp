'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { Message } from './use-messages';

const KEY = ['my-conversation'];

/** GET /conversations/me → müşterinin tek sohbetindeki mesaj dizisi. */
export function useMyMessages() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: () => authedApi<Message[]>('/conversations/me'),
    enabled: isAuthenticated,
    refetchInterval: 12_000,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) =>
      authedApi('/conversations/me/messages', {
        method: 'POST',
        body: JSON.stringify({ content }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
