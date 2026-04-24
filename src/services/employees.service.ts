import type { User } from '@/types';
import api from '@/api/api.client';

export async function getEmployees(): Promise<User[]> {
  const response = await api.get('/admin/employees');
  console.log('DEBUG FRONTEND - Datos recibidos de /admin/employees:', response.data);
  // Backend returns: employee_id, full_name, email, role, phone, is_active
  // Frontend expects: id, name, email, role, active
  return response.data.map((e: any) => ({
    id: String(e.employee_id),
    name: e.full_name || e.name || 'Sin Nombre',
    email: e.email,
    role: e.role?.toUpperCase() || 'EMPLOYEE',
    active: e.is_active,
  }));
}

export async function createEmployee(data: Omit<User, 'id'> & { password: string }): Promise<User> {
  const payload = {
    full_name: data.name,
    email: data.email,
    password: data.password,
    role: data.role.toLowerCase(),
  };
  const response = await api.post('/admin/employees', payload);
  const e = response.data;
  return {
    id: String(e.employee_id),
    name: e.full_name,
    email: e.email,
    role: e.role?.toUpperCase() || 'EMPLOYEE',
    active: e.is_active,
  };
}

export async function updateEmployee(id: string, data: Partial<User>): Promise<User> {
  const payload: any = {};
  if (data.name !== undefined) payload.full_name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.role !== undefined) payload.role = data.role.toLowerCase();

  const response = await api.put(`/admin/employees/${id}`, payload);
  const e = response.data;
  return {
    id: String(e.employee_id),
    name: e.full_name,
    email: e.email,
    role: e.role?.toUpperCase() || 'EMPLOYEE',
    active: e.is_active,
  };
}

export async function deactivateEmployee(id: string): Promise<User> {
  const response = await api.patch(`/admin/employees/${id}/status`, { is_active: false });
  const e = response.data;
  return {
    id: String(e.employee_id),
    name: e.full_name,
    email: e.email,
    role: e.role?.toUpperCase() || 'EMPLOYEE',
    active: e.is_active,
  };
}
