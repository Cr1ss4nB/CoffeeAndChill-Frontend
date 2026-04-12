import type { InventoryItem, StockStatus } from '@/types';

function calcStatus(stock: number, minStock: number): StockStatus {
  if (stock === 0) return 'OUT';
  if (stock <= minStock) return 'LOW';
  return 'OK';
}

const mockInventory: InventoryItem[] = [
  // Consumo
  { id: 'i1', name: 'Café en grano (kg)', category: 'consumo', subcategory: 'Bebidas', stock: 8, unit: 'kg', minStock: 3, status: 'OK' },
  { id: 'i2', name: 'Leche entera (L)', category: 'consumo', subcategory: 'Bebidas', stock: 12, unit: 'L', minStock: 5, status: 'OK' },
  { id: 'i3', name: 'Leche de avena (L)', category: 'consumo', subcategory: 'Bebidas', stock: 2, unit: 'L', minStock: 3, status: 'LOW' },
  { id: 'i4', name: 'Matcha ceremonial (g)', category: 'consumo', subcategory: 'Bebidas', stock: 150, unit: 'g', minStock: 50, status: 'OK' },
  { id: 'i5', name: 'Chocolate belga (kg)', category: 'consumo', subcategory: 'Bebidas', stock: 1, unit: 'kg', minStock: 2, status: 'LOW' },
  { id: 'i6', name: 'Croissants (ud)', category: 'consumo', subcategory: 'Pasabocas', stock: 15, unit: 'ud', minStock: 5, status: 'OK' },
  { id: 'i7', name: 'Aguacate (ud)', category: 'consumo', subcategory: 'Pasabocas', stock: 0, unit: 'ud', minStock: 4, status: 'OUT' },
  { id: 'i8', name: 'Pan sourdough (ud)', category: 'consumo', subcategory: 'Pasabocas', stock: 6, unit: 'ud', minStock: 4, status: 'OK' },

  // Creativo
  { id: 'i9', name: 'Arcilla blanca (kg)', category: 'creativo', subcategory: 'Cerámica', stock: 25, unit: 'kg', minStock: 10, status: 'OK' },
  { id: 'i10', name: 'Esmalte transparente (L)', category: 'creativo', subcategory: 'Cerámica', stock: 3, unit: 'L', minStock: 2, status: 'OK' },
  { id: 'i11', name: 'Kit Primavera', category: 'creativo', subcategory: 'Kits de pintura', stock: 5, unit: 'kit', minStock: 2, status: 'OK', colors: ['#E8B4B8', '#A8D5BA', '#F5E6A8', '#B8C9E8', '#F2C4A0', '#C8A8E8'] },
  { id: 'i12', name: 'Kit Atardecer', category: 'creativo', subcategory: 'Kits de pintura', stock: 1, unit: 'kit', minStock: 2, status: 'LOW', colors: ['#E86850', '#F4A460', '#FFD700', '#FF6B81', '#C85A54', '#8B4513'] },
  { id: 'i13', name: 'Kit Océano', category: 'creativo', subcategory: 'Kits de pintura', stock: 3, unit: 'kit', minStock: 2, status: 'OK', colors: ['#1E90FF', '#00CED1', '#20B2AA', '#4682B4', '#5F9EA0', '#B0E0E6'] },
  { id: 'i14', name: 'Pintura acrílica Rojo', category: 'creativo', subcategory: 'Pinturas', stock: 8, unit: 'ud', minStock: 3, status: 'OK', volume: '50ml' },
  { id: 'i15', name: 'Pintura acrílica Azul', category: 'creativo', subcategory: 'Pinturas', stock: 2, unit: 'ud', minStock: 3, status: 'LOW', volume: '100ml' },
  { id: 'i16', name: 'Pintura acrílica Dorado', category: 'creativo', subcategory: 'Pinturas', stock: 12, unit: 'ud', minStock: 3, status: 'OK', volume: '25ml' },
  { id: 'i17', name: 'Pinceles redondos (set)', category: 'creativo', subcategory: 'Herramientas', stock: 7, unit: 'set', minStock: 3, status: 'OK' },
  { id: 'i18', name: 'Pinceles planos (set)', category: 'creativo', subcategory: 'Herramientas', stock: 0, unit: 'set', minStock: 3, status: 'OUT' },
];

// TODO: GET /inventory
export async function getInventoryItems(): Promise<InventoryItem[]> {
  return Promise.resolve([...mockInventory]);
}

// TODO: POST /inventory
export async function createInventoryItem(data: Omit<InventoryItem, 'id' | 'status'>): Promise<InventoryItem> {
  const newItem: InventoryItem = {
    ...data,
    id: `i${mockInventory.length + 1}`,
    status: calcStatus(data.stock, data.minStock),
  };
  mockInventory.push(newItem);
  return Promise.resolve({ ...newItem });
}

// TODO: PATCH /inventory/:id
export async function updateInventoryItem(id: string, data: Partial<InventoryItem>): Promise<InventoryItem> {
  const item = mockInventory.find((i) => i.id === id);
  if (!item) throw new Error('Item not found');
  Object.assign(item, data);
  item.status = calcStatus(item.stock, item.minStock);
  return Promise.resolve({ ...item });
}
