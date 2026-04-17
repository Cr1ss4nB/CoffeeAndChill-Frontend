// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Re-import module fresh before each test to reset mock state
let getInventoryItems: typeof import('./inventory.service').getInventoryItems;
let createInventoryItem: typeof import('./inventory.service').createInventoryItem;
let updateInventoryItem: typeof import('./inventory.service').updateInventoryItem;

describe('inventory.service', () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./inventory.service');
    getInventoryItems = mod.getInventoryItems;
    createInventoryItem = mod.createInventoryItem;
    updateInventoryItem = mod.updateInventoryItem;
  });

  it('getInventoryItems returns all items', async () => {
    const items = await getInventoryItems();
    expect(items.length).toBeGreaterThan(0);
  });

  it('getInventoryItems returns a copy (not the mutable reference)', async () => {
    const first = await getInventoryItems();
    const second = await getInventoryItems();
    expect(first).not.toBe(second);
  });

  it('every item has required fields', async () => {
    const items = await getInventoryItems();
    for (const item of items) {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('name');
      expect(item).toHaveProperty('stock');
      expect(item).toHaveProperty('minStock');
      expect(item).toHaveProperty('status');
    }
  });

  it('createInventoryItem adds item with correct status OK', async () => {
    const newItem = {
      name: 'Test Item',
      category: 'consumo' as const,
      subcategory: 'Bebidas',
      stock: 10,
      unit: 'kg',
      minStock: 3,
    };
    const result = await createInventoryItem(newItem);
    expect(result.status).toBe('OK');
    expect(result.name).toBe('Test Item');
  });

  it('createInventoryItem sets status LOW when stock <= minStock', async () => {
    const newItem = {
      name: 'Low Item',
      category: 'consumo' as const,
      subcategory: 'Bebidas',
      stock: 2,
      unit: 'L',
      minStock: 3,
    };
    const result = await createInventoryItem(newItem);
    expect(result.status).toBe('LOW');
  });

  it('createInventoryItem sets status OUT when stock is 0', async () => {
    const newItem = {
      name: 'Out Item',
      category: 'consumo' as const,
      subcategory: 'Bebidas',
      stock: 0,
      unit: 'ud',
      minStock: 5,
    };
    const result = await createInventoryItem(newItem);
    expect(result.status).toBe('OUT');
  });

  it('updateInventoryItem updates the item in place', async () => {
    const items = await getInventoryItems();
    const targetId = items[0].id;

    const updated = await updateInventoryItem(targetId, { stock: 50 });
    expect(updated.stock).toBe(50);
    expect(updated.id).toBe(targetId);
  });

  it('updateInventoryItem recalculates status after stock change', async () => {
    const items = await getInventoryItems();
    const target = items.find((i) => i.status === 'OK');
    if (!target) return;

    const updated = await updateInventoryItem(target.id, { stock: 0 });
    expect(updated.status).toBe('OUT');
  });

  it('updateInventoryItem throws for unknown id', async () => {
    await expect(updateInventoryItem('nonexistent-id', { stock: 1 })).rejects.toThrow('Item not found');
  });
});
