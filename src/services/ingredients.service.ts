import api from '@/api/api.client';

export interface Ingredient {
  ingredient_id: number;
  name: string;
  unit: string;
  description?: string;
  min_stock: number;
  is_active: boolean;
  current_stock: number;
  is_low_stock: boolean;
}

export interface ConsumptionItem {
  id: number;
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  quantity_used: number;
}

export interface IngredientCreate {
  name: string;
  unit: string;
  description?: string;
  min_stock: number;
}

export interface IngredientUpdate {
  name?: string;
  unit?: string;
  description?: string;
  min_stock?: number;
  is_active?: boolean;
}

export async function getIngredients(activeOnly = true): Promise<Ingredient[]> {
  const response = await api.get<Ingredient[]>(`/ingredients?active_only=${activeOnly}`);
  return response.data;
}

export async function createIngredient(data: IngredientCreate): Promise<Ingredient> {
  const response = await api.post<Ingredient>('/ingredients', data);
  return response.data;
}

export async function updateIngredient(id: number, data: IngredientUpdate): Promise<Ingredient> {
  const response = await api.patch<Ingredient>(`/ingredients/${id}`, data);
  return response.data;
}

export async function adjustIngredientStock(
  ingredientId: number,
  quantity: number,
  reason: string,
  notes?: string
): Promise<{ message: string; new_stock: number; unit: string }> {
  const response = await api.post('/ingredients/adjustments', {
    ingredient_id: ingredientId,
    quantity,
    reason,
    notes,
  });
  return response.data;
}

export async function getProductConsumption(productId: number): Promise<ConsumptionItem[]> {
  const response = await api.get<ConsumptionItem[]>(`/ingredients/products/${productId}/consumption`);
  return response.data;
}

export async function upsertProductConsumption(
  productId: number,
  items: { ingredient_id: number; quantity_used: number }[]
): Promise<ConsumptionItem[]> {
  const response = await api.post<ConsumptionItem[]>(
    `/ingredients/products/${productId}/consumption`,
    { items }
  );
  return response.data;
}
