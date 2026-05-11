import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/api.client';
import toast from 'react-hot-toast';
import {
  createCategory,
  updateCategory,
  toggleCategoryStatus,
  type CategoryCreate,
  type CategoryUpdate,
} from '@/services/categories.service';

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
  image_url?: string;
  fulfillment_type?: string;
  available_to_sell?: number;
  ingredient_limited?: boolean;
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

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/catalog/categories?active_only=false');
      return response.data;
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoryCreate) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Categoría creada exitosamente');
    },
    onError: () => {
      toast.error('Error al crear la categoría');
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoryUpdate }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Categoría actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar la categoría');
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      toggleCategoryStatus(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Estado actualizado');
    },
    onError: (err: { response?: { data?: { detail?: string } } }) => {
      toast.error(err.response?.data?.detail || 'Error al cambiar el estado');
    },
  });
}
