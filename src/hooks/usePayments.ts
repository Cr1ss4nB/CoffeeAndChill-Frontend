import { useQuery } from '@tanstack/react-query';
import api from '@/api/api.client';

export interface PaymentRecord {
  payment_id: number;
  order_id: number;
  table_number: number | null;
  table_code: string | null;
  payment_method: string;
  amount: number;
  tip_amount: number;
  total: number;
  payment_date: string;
  cashier: string | null;
}

export interface PaymentSummary {
  count: number;
  total_ventas: number;
  total_propinas: number;
  total_con_propinas: number;
}

export interface PaymentsResponse {
  payments: PaymentRecord[];
  summary: PaymentSummary;
  date: string;
}

export function usePayments(date?: string) {
  return useQuery<PaymentsResponse>({
    queryKey: ['payments', date],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (date) params.date = date;
      const r = await api.get<PaymentsResponse>('/payments', { params });
      return r.data;
    },
    staleTime: 30_000,
  });
}
