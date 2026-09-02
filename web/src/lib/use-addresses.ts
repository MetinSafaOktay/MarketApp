'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { Address } from './types';

const KEY = ['addresses'];

export function useAddresses() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: KEY,
    queryFn: () => authedApi<Address[]>('/addresses'),
    enabled: isAuthenticated,
  });
}

export interface AddressInput {
  label: string;
  full_address: string;
  city: string;
  district: string;
  is_default?: boolean;
}

export function useAddressMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });
  return {
    create: useMutation({
      mutationFn: (input: AddressInput) =>
        authedApi<Address>('/addresses', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Partial<AddressInput> }) =>
        authedApi<Address>(`/addresses/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(input),
        }),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (id: string) =>
        authedApi(`/addresses/${id}`, { method: 'DELETE' }),
      onSuccess: invalidate,
    }),
  };
}

// Geriye dönük uyumluluk (checkout eski adı kullanıyor)
export function useAddAddress() {
  return useAddressMutations().create;
}
export type NewAddress = AddressInput;
