import { useState } from 'react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { WorkshopList } from '@/components/organisms/WorkshopList/WorkshopList';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useWorkshops, useReservations } from '@/hooks/useWorkshops';
import { useAuthStore } from '@/store/auth.store';
import type { Workshop } from '@/types';

export default function WorkshopsPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';
  const { data: workshops } = useWorkshops();
  const [selectedWs, setSelectedWs] = useState<string | undefined>(undefined);
  const { data: reservations, isLoading: resLoading } = useReservations(selectedWs);

  return (
    <DashboardTemplate title="Talleres">
      <WorkshopList />

      {/* Admin: reservations per workshop */}
      {isAdmin && workshops && workshops.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display font-bold text-text-primary mb-4">Reservaciones por Taller</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {workshops.map((w: Workshop) => (
              <button
                key={w.id}
                onClick={() => setSelectedWs(w.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  selectedWs === w.id
                    ? 'bg-white/60 text-text-primary shadow-sm'
                    : 'text-text-secondary hover:bg-white/30'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>

          {selectedWs && (
            <div className="glass p-5">
              {resLoading ? (
                <div className="flex justify-center py-6"><Spinner /></div>
              ) : reservations && reservations.length > 0 ? (
                <div className="space-y-2">
                  {reservations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/30 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{r.name}</p>
                        <p className="text-xs text-text-secondary">{r.email} · {r.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary">{r.attendees} persona(s)</span>
                        <Badge className={r.attended ? 'bg-sage/60 text-green-700' : 'bg-peach/60 text-amber-700'}>
                          {r.attended ? 'Asistió' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-text-secondary py-4">No hay reservaciones aún</p>
              )}
            </div>
          )}
        </div>
      )}
    </DashboardTemplate>
  );
}
