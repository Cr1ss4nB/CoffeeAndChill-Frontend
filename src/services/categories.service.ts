import api from '@/api/api.client';
import type { Category } from '@/hooks/useCatalog';

export interface CategoryCreate {
  category_name: string;
  type: 'PRODUCT' | 'WORKSHOP';
  description?: string;
}

export interface CategoryUpdate {
  category_name?: string;
  description?: string;
  is_active?: boolean;
}

export async function getWorkshopCategories(): Promise<Category[]> {
  const response = await api.get('/catalog/categories');
  return response.data.filter((c: Category) => c.type === 'WORKSHOP');
}

export async function getAllCategories(): Promise<Category[]> {
  const response = await api.get('/catalog/categories');
  return response.data;
}

export async function createCategory(data: CategoryCreate): Promise<Category> {
  const response = await api.post('/categories', data);
  return response.data;
}

export async function updateCategory(id: number, data: CategoryUpdate): Promise<Category> {
  const response = await api.patch(`/categories/${id}`, data);
  return response.data;
}

export async function toggleCategoryStatus(id: number, is_active: boolean): Promise<Category> {
  const response = await api.patch(`/categories/${id}/status`, { is_active });
  return response.data;
}