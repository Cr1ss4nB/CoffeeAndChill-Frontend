import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryItems, createInventoryItem } from '@/services/inventory.service';
import type { InventoryItem } from '@/types';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: getInventoryItems,
    staleTime: 60000,
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<InventoryItem, 'id' | 'status'>) => createInventoryItem(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

import { adjustInventory, getInventoryMovements } from '@/services/inventory.service';

export function useAdjustInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity, reason, notes }: { productId: number; quantity: number; reason: string; notes?: string }) =>
      adjustInventory(productId, quantity, reason, notes),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}

export function useInventoryMovements(page = 1, limit = 20, userId?: string) {
  return useQuery({
    queryKey: ['inventory-movements', page, limit, userId],
    queryFn: () => getInventoryMovements(page, limit, userId),
  });
}
