import type { User } from '@/types';

const mockEmployees: User[] = [
  { id: 'e1', name: 'Valentina Rojas', email: 'valentina@coffeechill.co', role: 'ADMIN', active: true },
  { id: 'e2', name: 'Santiago Herrera', email: 'santiago@coffeechill.co', role: 'EMPLOYEE', active: true },
  { id: 'e3', name: 'Camila Torres', email: 'camila@coffeechill.co', role: 'EMPLOYEE', active: true },
  { id: 'e4', name: 'Andrés Medina', email: 'andres@coffeechill.co', role: 'EMPLOYEE', active: false },
];

// TODO: GET /employees
export async function getEmployees(): Promise<User[]> {
  return Promise.resolve([...mockEmployees]);
}

// TODO: POST /employees
export async function createEmployee(data: Omit<User, 'id'> & { password: string }): Promise<User> {
  const { password, ...userData } = data;
  const newEmp: User = { ...userData, id: `e${mockEmployees.length + 1}` };
  mockEmployees.push(newEmp);
  return Promise.resolve({ ...newEmp });
}

// TODO: PATCH /employees/:id
export async function updateEmployee(id: string, data: Partial<User>): Promise<User> {
  const emp = mockEmployees.find((e) => e.id === id);
  if (!emp) throw new Error('Employee not found');
  Object.assign(emp, data);
  return Promise.resolve({ ...emp });
}

// TODO: DELETE /employees/:id (soft delete)
export async function deactivateEmployee(id: string): Promise<User> {
  const emp = mockEmployees.find((e) => e.id === id);
  if (!emp) throw new Error('Employee not found');
  emp.active = false;
  return Promise.resolve({ ...emp });
}
