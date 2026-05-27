import axios from 'axios';

const publicClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

export const getTableInfo = (tableCode: string) =>
  publicClient.get(`/public/tables/${tableCode}`).then((r) => r.data);

export const getPublicTables = () =>
  publicClient.get('/public/tables').then((r) => r.data);

export const getPublicMenu = (categoryId?: number) =>
  publicClient
    .get('/public/menu', { params: categoryId ? { category_id: categoryId } : {} })
    .then((r) => r.data);

export const placePublicOrder = (payload: {
  table_code?: string;
  order_type: 'DINE_IN' | 'TAKEAWAY';
  items: { product_id: number; quantity: number; special_instructions?: string }[];
  notes?: string;
}) => publicClient.post('/public/orders', payload).then((r) => r.data);

export const getPublicOrderStatus = (orderId: number) =>
  publicClient
    .get(`/public/orders/${orderId}`, { params: { _t: Date.now() } })
    .then((r) => r.data);
