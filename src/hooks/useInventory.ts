import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInventoryItems, createInventoryItem, updateInventoryItem } from '@/services/inventory.service';
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

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InventoryItem> }) =>
      updateInventoryItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
}
