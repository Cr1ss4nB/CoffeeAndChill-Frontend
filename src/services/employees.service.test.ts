// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

let getEmployees: typeof import('./employees.service').getEmployees;
let createEmployee: typeof import('./employees.service').createEmployee;
let updateEmployee: typeof import('./employees.service').updateEmployee;
let deactivateEmployee: typeof import('./employees.service').deactivateEmployee;

describe('employees.service', () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./employees.service');
    getEmployees = mod.getEmployees;
    createEmployee = mod.createEmployee;
    updateEmployee = mod.updateEmployee;
    deactivateEmployee = mod.deactivateEmployee;
  });

  it('getEmployees returns all employees', async () => {
    const employees = await getEmployees();
    expect(employees.length).toBeGreaterThan(0);
  });

  it('getEmployees returns a copy (not the mutable reference)', async () => {
    const first = await getEmployees();
    const second = await getEmployees();
    expect(first).not.toBe(second);
  });

  it('every employee has required fields', async () => {
    const employees = await getEmployees();
    for (const emp of employees) {
      expect(emp).toHaveProperty('id');
      expect(emp).toHaveProperty('name');
      expect(emp).toHaveProperty('email');
      expect(emp).toHaveProperty('role');
      expect(emp).toHaveProperty('active');
    }
  });

  it('createEmployee adds employee without storing password', async () => {
    const newEmp = {
      name: 'New Employee',
      email: 'new@coffeechill.co',
      role: 'EMPLOYEE' as const,
      active: true,
      password: 'secret123',
    };
    const result = await createEmployee(newEmp);
    expect(result.name).toBe('New Employee');
    expect(result.email).toBe('new@coffeechill.co');
    // Password must NOT be stored in the returned object
    expect(result).not.toHaveProperty('password');
  });

  it('createEmployee assigns a unique id', async () => {
    const emp1 = await createEmployee({ name: 'E1', email: 'e1@c.co', role: 'EMPLOYEE', active: true, password: 'p' });
    const emp2 = await createEmployee({ name: 'E2', email: 'e2@c.co', role: 'EMPLOYEE', active: true, password: 'p' });
    expect(emp1.id).not.toBe(emp2.id);
  });

  it('updateEmployee modifies existing employee fields', async () => {
    const employees = await getEmployees();
    const targetId = employees[0].id;

    const updated = await updateEmployee(targetId, { name: 'Updated Name' });
    expect(updated.name).toBe('Updated Name');
    expect(updated.id).toBe(targetId);
  });

  it('updateEmployee throws for unknown id', async () => {
    await expect(updateEmployee('bad-id', { name: 'X' })).rejects.toThrow('Employee not found');
  });

  it('deactivateEmployee sets active to false', async () => {
    const employees = await getEmployees();
    const activeEmp = employees.find((e) => e.active);
    if (!activeEmp) return;

    const result = await deactivateEmployee(activeEmp.id);
    expect(result.active).toBe(false);
    expect(result.id).toBe(activeEmp.id);
  });

  it('deactivateEmployee throws for unknown id', async () => {
    await expect(deactivateEmployee('bad-id')).rejects.toThrow('Employee not found');
  });
});
