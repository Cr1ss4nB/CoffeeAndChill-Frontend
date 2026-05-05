import type { InventoryItem } from '@/types';
import api from '@/api/api.client';

export async function getInventoryItems(): Promise<{ items: InventoryItem[], low_stock_count: number }> {
  const response = await api.get('/inventory?limit=100');
  const items = response.data.items.map((i: any) => ({
    id: String(i.product_id),
    name: i.name,
    category: (i.category?.toLowerCase() ?? '').includes('creativ')
      ? 'materiales'
      : (i.category?.toLowerCase() ?? '').includes('insum')
        ? 'insumos'
        : (i.category?.toLowerCase() ?? '').includes('product')
          ? 'productos'
          : 'insumos',
    subcategory: i.category,
    stock: i.stock_quantity,
    unit: 'ud',
    minStock: 0,
    status: i.is_low_stock ? 'LOW' : (i.stock_quantity === 0 ? 'OUT' : 'OK'),
  }));

  return {
    items,
    low_stock_count: response.data.low_stock_count
  };
}

export async function createInventoryItem(
  data: Omit<InventoryItem, 'id' | 'status'> & { category_id?: number; price?: number }
): Promise<InventoryItem> {
  // Product creation requires category_id (from API) and price.
  // Use ProductsPage (/products) for full product management.
  const p_res = await api.post('/products', {
    name: data.name,
    price: data.price,
    stock_quantity: 0,
    category_id: data.category_id,
    description: data.subcategory,
    status: 'ACTIVE',
  });
  const newId: number = p_res.data.product_id;

  if (data.stock > 0) {
    await api.post('/inventory/adjustments', {
      product_id: newId,
      quantity: data.stock,
      reason: 'RECEIPT',
      notes: 'Stock inicial',
    });
  }

  return {
    ...data,
    id: String(newId),
    status: data.stock === 0 ? 'OUT' : 'OK',
  };
}

export async function updateInventoryItem(): Promise<InventoryItem> {
  // Actualizar inventario significa hacer una corrección/ajuste.
  // El UI envía "stock" como el total deseado. El backend pide el ajuste.
  // Es mejor crear una función explícita para ajustes.
  throw new Error('Please use adjustInventory instead of generic update');
}

export async function adjustInventory(productId: number, quantity: number, reason: string, notes?: string): Promise<any> {
    const response = await api.post('/inventory/adjustments', {
        product_id: productId,
        quantity,
        reason,
        notes
    });
    return response.data;
}

export async function getInventoryMovements(page = 1, limit = 20, userId?: string): Promise<any> {
    const url = userId 
      ? `/inventory/movements?page=${page}&limit=${limit}&system_user_id=${userId}`
      : `/inventory/movements?page=${page}&limit=${limit}`;
    const response = await api.get(url);
    return response.data;
}