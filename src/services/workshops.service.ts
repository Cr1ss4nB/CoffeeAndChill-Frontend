import type { Workshop, Reservation } from '@/types';

import api from '@/api/api.client';

interface WorkshopSchedulePayload {
  schedule_date: string;
  start_time: string;
  end_time: string;
  available_slots: number;
}

export interface CreateWorkshopPayload {
  name: string;
  category_id: number;
  description?: string;
  duration_minutes: number;
  max_capacity: number;
  price: number;
  instructor_name?: string;
  schedules: WorkshopSchedulePayload[];
}

function mapWorkshop(w: any): Workshop {
  return {
    id: String(w.workshop_id),
    name: w.name,
    description: w.description || '',
    date: w.schedules?.[0]?.schedule_date || 'TBD',
    time: w.schedules?.[0]?.start_time || 'TBD',
    price: w.price,
    totalSpots: w.max_capacity,
    reservedSpots: w.max_capacity - (w.schedules?.[0]?.available_slots || 0),
  };
}

export async function createWorkshop(data: CreateWorkshopPayload): Promise<Workshop> {
  const response = await api.post('/workshops', data);
  return mapWorkshop(response.data);
}

export async function updateWorkshop(id: string, data: Partial<Workshop>): Promise<Workshop> {
  const response = await api.put(`/workshops/${id}`, data);
  return mapWorkshop(response.data);
}

export async function deleteWorkshop(id: string): Promise<void> {
  await api.delete(`/workshops/${id}`);
}

export async function getWorkshops(): Promise<Workshop[]> {
  const response = await api.get('/workshops');
  // Handle both direct array responses and wrapped responses
  const data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
  return data.map((w: any) => mapWorkshop(w));
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
    attendees: data.attendees,
    schedule_id: data.scheduleId, // <-- AÑADIDO: Enviar el ID del horario
  });
  const r = response.data;
  
  // El backend ahora devuelve un objeto más completo y consistente
  return {
    id: String(r.reservation_id),
    workshopId: String(r.workshop_id),
    scheduleId: String(r.schedule_id),
    name: r.full_name,
    email: r.email,
    phone: r.phone,
    attendees: r.attendees,
    attended: r.attended,
    createdAt: r.created_at,
  };
}
