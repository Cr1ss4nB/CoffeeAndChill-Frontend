import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployees, createEmployee, updateEmployee, deactivateEmployee } from '@/services/employees.service';
import type { User } from '@/types';

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: getEmployees,
    staleTime: 60000,
  });
}

export function useCreateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<User, 'id'> & { password: string }) => createEmployee(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => updateEmployee(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useDeactivateEmployee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deactivateEmployee(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['employees'] }),
  });
}
