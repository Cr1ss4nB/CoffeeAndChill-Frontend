import type { Workshop, Reservation } from '@/types';

const mockWorkshops: Workshop[] = [
  { id: 'w1', name: 'Cerámica para Principiantes', description: 'Aprende las bases del torno y moldeo a mano', date: '2026-05-08', time: '10:00', totalSpots: 12, reservedSpots: 8, price: 85000 },
  { id: 'w2', name: 'Pintura en Cerámica', description: 'Técnicas de esmaltado y pinceladas decorativas', date: '2026-05-10', time: '15:00', totalSpots: 10, reservedSpots: 10, price: 65000 },
  { id: 'w3', name: 'Acuarela Botánica', description: 'Pinta flores y hojas con técnica húmedo sobre húmedo', date: '2026-05-15', time: '11:00', totalSpots: 15, reservedSpots: 5, price: 55000 },
  { id: 'w4', name: 'Noche de Cerámica & Vino', description: 'Sesión nocturna con copa de vino incluida', date: '2026-05-20', time: '19:00', totalSpots: 8, reservedSpots: 3, price: 120000 },
];

const mockReservations: Reservation[] = [
  { id: 'r1', workshopId: 'w1', name: 'María García', email: 'maria@email.com', phone: '3001234567', attendees: 2, attended: false, createdAt: '2026-04-20T10:00:00Z' },
  { id: 'r2', workshopId: 'w1', name: 'Carlos López', email: 'carlos@email.com', phone: '3109876543', attendees: 1, attended: false, createdAt: '2026-04-21T14:30:00Z' },
  { id: 'r3', workshopId: 'w3', name: 'Ana Martínez', email: 'ana@email.com', phone: '3201112233', attendees: 3, attended: false, createdAt: '2026-04-25T09:00:00Z' },
];

// TODO: GET /workshops
export async function getWorkshops(): Promise<Workshop[]> {
  return Promise.resolve([...mockWorkshops]);
}

// TODO: GET /workshops/:id/reservations
export async function getReservations(workshopId: string): Promise<Reservation[]> {
  return Promise.resolve(mockReservations.filter((r) => r.workshopId === workshopId));
}

// TODO: POST /workshops/:id/reservations
export async function createReservation(data: Omit<Reservation, 'id' | 'attended' | 'createdAt'>): Promise<Reservation> {
  const newRes: Reservation = {
    ...data,
    id: `r${mockReservations.length + 1}`,
    attended: false,
    createdAt: new Date().toISOString(),
  };
  mockReservations.push(newRes);
  const workshop = mockWorkshops.find((w) => w.id === data.workshopId);
  if (workshop) workshop.reservedSpots += data.attendees;
  return Promise.resolve({ ...newRes });
}
