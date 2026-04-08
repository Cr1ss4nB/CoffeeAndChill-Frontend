import { useQuery } from '@tanstack/react-query';
import api from '@/api/api.client';

export interface Category {
  category_id: number;
  category_name: string;
  type: 'PRODUCT' | 'WORKSHOP';
  description?: string;
  is_active: boolean;
}

export interface Product {
  product_id: number;
  name: string;
  category_id: number;
  price: number;
  stock_quantity: number;
  status: string;
  description?: string;
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/catalog/categories');
      return response.data;
    },
  });
}

export function useProducts(categoryId?: number) {
  return useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      const url = categoryId 
        ? `/catalog/products?category_id=${categoryId}` 
        : '/catalog/products';
      const response = await api.get<Product[]>(url);
      return response.data;
    },
  });
}
