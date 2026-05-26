import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getTableInfo, getPublicMenu, getPublicOrderStatus, getPublicTables } from '../services/public.service';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const useTableInfo = (tableCode: string) =>
  useQuery({
    queryKey: ['public-table', tableCode],
    queryFn: () => getTableInfo(tableCode),
    retry: false,
  });

export const usePublicMenu = (categoryId?: number) =>
  useQuery({
    queryKey: ['public-menu', categoryId],
    queryFn: () => getPublicMenu(categoryId),
  });

export const usePublicTables = () =>
  useQuery({
    queryKey: ['public-tables'],
    queryFn: getPublicTables,
    staleTime: 60_000,
  });

export function usePublicOrderStatus(orderId: number | null) {
  const queryClient = useQueryClient();

  // Initial fetch — source of truth on mount and SSE reconnect
  const query = useQuery({
    queryKey: ['public-order-status', orderId],
    queryFn: () => getPublicOrderStatus(orderId!),
    enabled: !!orderId,
    staleTime: 30_000,
    retry: 0,
  });

  useEffect(() => {
    if (!orderId) return;

    const es = new EventSource(`${API_BASE}/public/orders/${orderId}/stream`);

    es.onmessage = (e) => {
      if (!e.data) return;
      const updated = JSON.parse(e.data);
      queryClient.setQueryData(['public-order-status', orderId], updated);
    };

    es.onerror = () => {
      // SSE lost — invalidate so query refetches current state
      void queryClient.invalidateQueries({ queryKey: ['public-order-status', orderId] });
    };

    return () => es.close();
  }, [orderId, queryClient]);

  return query;
}
