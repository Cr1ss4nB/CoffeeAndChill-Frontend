import { useState } from 'react';
import type { Ingredient } from '@/services/ingredients.service';

export interface RecipeRow {
  ingredient_id: number;
  quantity_used: number;
}

export function useRecipeRows(ingredients: Ingredient[] | undefined, initial: RecipeRow[] = []) {
  const [rows, setRows] = useState<RecipeRow[]>(initial);
  const [initialized, setInitialized] = useState(initial.length > 0);

  function init(data: RecipeRow[]) {
    if (!initialized) {
      setRows(data);
      setInitialized(true);
    }
  }

  function addRow() {
    const firstUnused = ingredients?.find((i) => !rows.some((r) => r.ingredient_id === i.ingredient_id));
    if (!firstUnused) return;
    setRows((prev) => [...prev, { ingredient_id: firstUnused.ingredient_id, quantity_used: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof RecipeRow, value: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  return { rows, init, addRow, removeRow, updateRow };
}
