import type { InventoryItem } from '@/types';
import api from '@/api/api.client';

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const response = await api.get('/inventory?limit=100');
  // Backend returns: product_id, name, category, price, stock_quantity, status, is_low_stock
  return response.data.items.map((i: any) => ({
    id: String(i.product_id),
    name: i.name,
    category: i.category.toLowerCase() === 'creativo' ? 'creativo' : 'consumo',
    subcategory: i.category,
    stock: i.stock_quantity,
    unit: 'ud',
    minStock: 0,
    status: i.is_low_stock ? 'LOW' : (i.stock_quantity === 0 ? 'OUT' : 'OK'),
  }));
}

export async function createInventoryItem(
  data: Omit<InventoryItem, 'id' | 'status'> & { category_id: number; price: number }
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

export async function updateInventoryItem(_id: string, _data: Partial<InventoryItem>): Promise<InventoryItem> {
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
