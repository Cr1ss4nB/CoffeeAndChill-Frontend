// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from 'vitest';

let getWorkshops: typeof import('./workshops.service').getWorkshops;
let getReservations: typeof import('./workshops.service').getReservations;
let createReservation: typeof import('./workshops.service').createReservation;

describe('workshops.service', () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('./workshops.service');
    getWorkshops = mod.getWorkshops;
    getReservations = mod.getReservations;
    createReservation = mod.createReservation;
  });

  it('getWorkshops returns all workshops', async () => {
    const workshops = await getWorkshops();
    expect(workshops.length).toBeGreaterThan(0);
  });

  it('getWorkshops returns a copy (not the mutable reference)', async () => {
    const first = await getWorkshops();
    const second = await getWorkshops();
    expect(first).not.toBe(second);
  });

  it('every workshop has required fields', async () => {
    const workshops = await getWorkshops();
    for (const w of workshops) {
      expect(w).toHaveProperty('id');
      expect(w).toHaveProperty('name');
      expect(w).toHaveProperty('price');
      expect(w).toHaveProperty('totalSpots');
      expect(w).toHaveProperty('reservedSpots');
    }
  });

  it('getReservations returns reservations for a specific workshop', async () => {
    const workshops = await getWorkshops();
    const firstId = workshops[0].id;
    const reservations = await getReservations(firstId);
    for (const r of reservations) {
      expect(r.workshopId).toBe(firstId);
    }
  });

  it('getReservations returns empty array for unknown workshop id', async () => {
    const reservations = await getReservations('nonexistent-id');
    expect(reservations).toHaveLength(0);
  });

  it('createReservation adds a reservation and returns it', async () => {
    const workshops = await getWorkshops();
    const firstWorkshop = workshops[0];

    const newReservation = {
      workshopId: firstWorkshop.id,
      name: 'Test User',
      email: 'test@test.com',
      phone: '3001234567',
      attendees: 2,
    };

    const result = await createReservation(newReservation);
    expect(result.name).toBe('Test User');
    expect(result.email).toBe('test@test.com');
    expect(result.workshopId).toBe(firstWorkshop.id);
    expect(result.id).toBeDefined();
    expect(result.attended).toBe(false);
    expect(result.createdAt).toBeDefined();
  });

  it('createReservation increments reservedSpots on the workshop', async () => {
    const workshops = await getWorkshops();
    const target = workshops.find((w) => w.reservedSpots < w.totalSpots);
    if (!target) return;

    const spotsBeforeRaw = target.reservedSpots;

    await createReservation({
      workshopId: target.id,
      name: 'Slot Test',
      email: 'slot@test.com',
      phone: '3000000000',
      attendees: 1,
    });

    // Fetch fresh list to check update
    const updatedWorkshops = await getWorkshops();
    const updated = updatedWorkshops.find((w) => w.id === target.id);
    expect(updated?.reservedSpots).toBe(spotsBeforeRaw + 1);
  });

  it('createReservation assigns unique ids', async () => {
    const workshops = await getWorkshops();
    const base = { workshopId: workshops[0].id, name: 'U', email: 'u@u.com', phone: '300', attendees: 1 };
    const r1 = await createReservation(base);
    const r2 = await createReservation(base);
    expect(r1.id).not.toBe(r2.id);
  });
});
