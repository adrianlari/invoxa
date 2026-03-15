'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => apiClient.get('/invoices')
  });
}
