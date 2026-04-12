import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWorkshops, getReservations, createReservation } from '@/services/workshops.service';
import type { Reservation } from '@/types';

export function useWorkshops() {
  return useQuery({
    queryKey: ['workshops'],
    queryFn: getWorkshops,
    staleTime: 60000,
  });
}

export function useReservations(workshopId: string | undefined) {
  return useQuery({
    queryKey: ['reservations', workshopId],
    queryFn: () => getReservations(workshopId!),
    staleTime: 60000,
    enabled: !!workshopId,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Reservation, 'id' | 'attended' | 'createdAt'>) =>
      createReservation(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workshops'] });
      qc.invalidateQueries({ queryKey: ['reservations'] });
    },
  });
}
