import api from '@/api/api.client';

export interface Category {
  category_id: number;
  category_name: string;
  type: string;
}

export async function getWorkshopCategories(): Promise<Category[]> {
  const response = await api.get('/catalog/categories');
  // Filtrar solo categorías de tipo WORKSHOP
  return response.data.filter((c: any) => c.type === 'WORKSHOP');
}
