'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authedApi } from './auth';
import { useIsAuthenticated } from './use-auth';
import type { Address } from './types';

export function useAddresses() {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => authedApi<Address[]>('/addresses'),
    enabled: isAuthenticated,
  });
}

export interface NewAddress {
  label: string;
  full_address: string;
  city: string;
  district: string;
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: NewAddress) =>
      authedApi<Address>('/addresses', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
