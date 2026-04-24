import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  adjustIngredientStock,
  getProductConsumption,
  upsertProductConsumption,
  type IngredientCreate,
  type IngredientUpdate,
} from '@/services/ingredients.service';

export function useIngredients(activeOnly = true) {
  return useQuery({
    queryKey: ['ingredients', activeOnly],
    queryFn: () => getIngredients(activeOnly),
  });
}

export function useCreateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IngredientCreate) => createIngredient(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useUpdateIngredient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredientUpdate }) =>
      updateIngredient(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useAdjustIngredientStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ingredientId,
      quantity,
      reason,
      notes,
    }: {
      ingredientId: number;
      quantity: number;
      reason: string;
      notes?: string;
    }) => adjustIngredientStock(ingredientId, quantity, reason, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ingredients'] }),
  });
}

export function useProductConsumption(productId: number) {
  return useQuery({
    queryKey: ['product-consumption', productId],
    queryFn: () => getProductConsumption(productId),
    enabled: productId > 0,
  });
}

export function useUpsertProductConsumption(productId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { ingredient_id: number; quantity_used: number }[]) =>
      upsertProductConsumption(productId, items),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['product-consumption', productId] }),
  });
}
