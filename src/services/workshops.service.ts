import type { Workshop, Reservation } from '@/types';

import api from '@/api/api.client';

export async function getWorkshops(): Promise<Workshop[]> {
  const response = await api.get('/workshops');
  // Map backend WorkshopResponse to frontend Workshop type
  return response.data.map((w: any) => ({
    id: String(w.workshop_id),
    name: w.name,
    description: w.description || '',
    date: w.schedules?.[0]?.schedule_date || 'TBD',
    time: w.schedules?.[0]?.start_time || 'TBD',
    price: w.price,
    totalSpots: w.max_capacity,
    reservedSpots: w.max_capacity - (w.schedules?.[0]?.available_slots || 0)
  }));
}

export async function getReservations(workshopId: string): Promise<Reservation[]> {
  const response = await api.get(`/workshops/${workshopId}/reservations`);
  return response.data.map((r: any) => ({
    id: String(r.reservation_id),
    workshopId: String(r.workshop_id),
    name: r.full_name,
    email: r.email,
    phone: r.phone,
    attendees: r.attendees,
    attended: r.attended,
    createdAt: r.created_at
  }));
}

export async function createReservation(data: Omit<Reservation, 'id' | 'attended' | 'createdAt'>): Promise<Reservation> {
  const response = await api.post(`/workshops/${data.workshopId}/reservations`, {
    full_name: data.name,
    email: data.email,
    phone: data.phone,
    attendees: data.attendees
  });
  const r = response.data;
  return {
    id: String(r.reservation_id),
    workshopId: String(r.workshop_id),
    name: r.full_name,
    email: r.email,
    phone: r.phone,
    attendees: r.attendees,
    attended: r.attended,
    createdAt: r.created_at
  };
}
