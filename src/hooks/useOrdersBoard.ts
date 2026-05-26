import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import api from '@/api/api.client';
import { useAuthStore } from '@/store/auth.store';

export interface BoardOrderItem {
  item_id: number;
  product_id: number;
  product_name: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: string;
  special_instructions: string | null;
}

export interface BoardOrder {
  order_id: number;
  customer_id: number | null;
  order_type: string;
  status: string;
  total_amount: number;
  order_date: string;
  table_id: number | null;
  table_number: number | null;
  table_code: string | null;
  notes: string | null;
  items: BoardOrderItem[];
}

export type KanbanColumn = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

const ORDERS_ENDPOINT = '/orders';
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';


export function useOrdersBoard() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const query = useQuery<BoardOrder[]>({
    queryKey: ['orders-board'],
    queryFn: async () => {
      const res = await api.get<BoardOrder[]>(ORDERS_ENDPOINT);
      return res.data;
    },
    retry: false,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!token) return;
    const ctrl = new AbortController();

    fetchEventSource(`${API_BASE}${ORDERS_ENDPOINT}/stream`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: ctrl.signal,
      openWhenHidden: true,
      onmessage(ev) {
        if (!ev.data) return;
        const updated: BoardOrder = JSON.parse(ev.data);
        queryClient.setQueryData<BoardOrder[]>(['orders-board'], (prev) => {
          if (!prev) return [updated];
          const exists = prev.some((o) => o.order_id === updated.order_id);
          return exists
            ? prev.map((o) => (o.order_id === updated.order_id ? updated : o))
            : [...prev, updated];
        });
      },
      onerror() {
        void queryClient.invalidateQueries({ queryKey: ['orders-board'] });
      },
    });

    return () => ctrl.abort();
  }, [token, queryClient]);

  return query;
}


export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await api.patch<BoardOrder>(`${ORDERS_ENDPOINT}/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<BoardOrder[]>(['orders-board'], (prev) => {
        if (!prev) return [updated];
        return prev.map((o) => (o.order_id === updated.order_id ? updated : o));
      });
    },
  });
}

export function groupByStatus(orders: BoardOrder[]): Record<KanbanColumn, BoardOrder[]> {
  return {
    PENDING:   orders.filter((o) => o.status === 'PENDING'),
    PREPARING: orders.filter((o) => o.status === 'PREPARING'),
    READY:     orders.filter((o) => o.status === 'READY'),
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED'),
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED'),
  };
}
