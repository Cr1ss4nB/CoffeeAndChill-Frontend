import api from '@/api/api.client';

export interface Category {
  category_id: number;
  category_name: string;
  type: 'PRODUCT' | 'WORKSHOP' | 'INGREDIENT';
  description?: string;
  is_active: boolean;
}

export async function getCategories(): Promise<Category[]> {
  const response = await api.get('/catalog/categories');
  return response.data;
}

export async function getWorkshopCategories(): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.type === 'WORKSHOP');
}

export async function createCategory(data: Omit<Category, 'category_id' | 'is_active'>): Promise<Category> {
  const response = await api.post('/catalog/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: Partial<Category>): Promise<Category> {
  const response = await api.put(`/catalog/categories/${id}`, data);
  return response.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/catalog/categories/${id}`);
}
