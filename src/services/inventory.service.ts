/*import type { InventoryItem } from '@/types';
import api from '@/api/api.client';

export async function getInventoryItems(): Promise<{ items: InventoryItem[], low_stock_count: number }> {
  const response = await api.get('/inventory?limit=100');
  const items = response.data.items.map((i: any) => ({
    id: String(i.product_id),
    name: i.name,
    category: i.category.toLowerCase().includes('creativ') ? 'creativo' : 'consumo',
    subcategory: i.category,
    stock: i.stock_quantity,
    unit: i.name.toLowerCase().includes('kit') ? 'kit' : 'ud', 
    minStock: 10,
    status: i.is_low_stock ? 'LOW' : 'OK',
    colors: i.name.toLowerCase().includes('kit primavera') ? ['#E8B4B8', '#A8D5BA', '#F5E6A8', '#B8C9E8', '#F2C4A0', '#C8A8E8'] :
            i.name.toLowerCase().includes('kit atardecer') ? ['#E86850', '#F4A460', '#FFD700', '#FF6B81', '#C85A54', '#8B4513'] :
            i.name.toLowerCase().includes('kit') ? ['#1E90FF', '#00CED1', '#20B2AA', '#4682B4', '#5F9EA0', '#B0E0E6'] : undefined,
    volume: i.name.toLowerCase().includes('pintura') ? '50ml' : undefined
  }));

  return {
    items,
    low_stock_count: response.data.low_stock_count
  };
}

export async function createInventoryItem(data: Omit<InventoryItem, 'id' | 'status'>): Promise<InventoryItem> {
  // En el sistema real, "crear inventario" significa hacer un Ajuste INicial o
  // la creación se hace desde Productos. Aquí creamos un producto nuevo
  // y luego hacemos un ajuste de inventario si el stock > 0
  
  // 1. Crear producto
  const productPayload = {
    name: data.name,
    price: 1000, // Dummy price, inventory manager usually doesn't set price, but it's required for ProductCreate
    stock_quantity: 0, // start with 0, then adjust to get traces
    category_id: data.category === 'creativo' ? 2 : 1, // mapping category id
    description: data.subcategory,
    status: 'ACTIVE'
  };
  
  const p_res = await api.post('/products', productPayload);
  const newId = p_res.data.product_id;

  // 2. Hacer el adjustment inicial si stock > 0
  if (data.stock > 0) {
    await api.post('/inventory/adjustments', {
      product_id: newId,
      quantity: data.stock,
      reason: 'RECEIPT',
      notes: 'Initial inventory creation'
    });
  }

  return {
    ...data,
    id: String(newId),
    status: data.stock <= (data.minStock || 10) ? (data.stock === 0 ? 'OUT' : 'LOW') : 'OK',
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
*/