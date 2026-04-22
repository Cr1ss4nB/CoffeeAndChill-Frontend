import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api.client';

// ── Types aligned with BE OrderResponse (feature/4.2-orders-backend) ──────────

export interface BoardOrderItem {
  item_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  status: string;
}

export interface BoardOrder {
  order_id: number;
  customer_id: number | null;
  order_type: string;
  status: string;
  total_amount: number;
  order_date: string;
  table_id: number | null;
  items: BoardOrderItem[];
}

export type KanbanColumn = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

// ── Orders board endpoint ────────────────────────────────────────────────────
// GET /orders returns staff-visible orders for the kanban board.
// ──────────────────────────────────────────────────────────────────────────────

const ORDERS_ENDPOINT = '/orders';

export function useOrdersBoard() {
  return useQuery<BoardOrder[]>({
    queryKey: ['orders-board'],
    queryFn: async () => {
      const res = await api.get<BoardOrder[]>(ORDERS_ENDPOINT);
      return res.data;
    },
    refetchInterval: 10_000, // polling cada 10 s para actualizar el tablero
    retry: false,            // no reintentar si el endpoint aún no existe
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const res = await api.patch<BoardOrder>(`${ORDERS_ENDPOINT}/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders-board'] });
    },
  });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

export function groupByStatus(orders: BoardOrder[]): Record<KanbanColumn, BoardOrder[]> {
  return {
    PENDING:     orders.filter((o) => o.status === 'PENDING'),
    IN_PROGRESS: orders.filter((o) => o.status === 'IN_PROGRESS'),
    COMPLETED:   orders.filter((o) => o.status === 'COMPLETED'),
  };
}
