import { useState } from 'react';
import { Plus } from 'lucide-react';
import { WorkshopForm } from '@/components/organisms/WorkshopAdminPanel/WorkshopForm';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { WorkshopList } from '@/components/organisms/WorkshopList/WorkshopList';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
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
  const [showForm, setShowForm] = useState(false);
  const [workshopSearch, setWorkshopSearch] = useState('');
  const [reservationSearch, setReservationSearch] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState<'ALL' | 'ATTENDED' | 'PENDING'>('ALL');

  const filteredReservations = (reservations || [])
    .filter((r) => {
      const term = reservationSearch.trim().toLowerCase();
      if (!term) {
        return true;
      }
      return (
        r.name.toLowerCase().includes(term)
        || r.email.toLowerCase().includes(term)
        || r.phone.toLowerCase().includes(term)
      );
    })
    .filter((r) => {
      if (attendanceFilter === 'ALL') {
        return true;
      }
      return attendanceFilter === 'ATTENDED' ? r.attended : !r.attended;
    });

  let reservationContent: React.ReactNode = null;
  if (resLoading) {
    reservationContent = <div className="flex justify-center py-6"><Spinner /></div>;
  } else if (filteredReservations.length > 0) {
    reservationContent = (
      <div className="space-y-2">
        {filteredReservations.map((r) => (
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
    );
  } else {
    reservationContent = <p className="text-center text-text-secondary py-4">No hay reservaciones que coincidan con los filtros</p>;
  }


  return (
    <DashboardTemplate title="Talleres">
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={workshopSearch} onChange={setWorkshopSearch} placeholder="Buscar taller..." />
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
            Nuevo Taller
          </Button>
        )}
      </div>

      {showForm && (
        <WorkshopForm onClose={() => setShowForm(false)} />
      )}
      <WorkshopList searchTerm={workshopSearch} />

      {/* Admin: reservations per workshop */}
      {isAdmin && workshops && workshops.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display font-bold text-text-primary mb-4">Reservaciones por Taller</h2>
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {workshops.map((w: Workshop) => (
              <Button
                key={w.id}
                onClick={() => setSelectedWs(w.id)}
                variant={selectedWs === w.id ? 'primary' : 'ghost'}
                size="sm"
                className={`whitespace-nowrap ${
                  selectedWs === w.id
                    ? ''
                    : 'text-text-secondary'
                }`}
              >
                {w.name}
              </Button>
            ))}
          </div>

          {selectedWs && (
            <div className="glass p-5">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <SearchBar value={reservationSearch} onChange={setReservationSearch} placeholder="Buscar reservación por nombre, email o teléfono..."/>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <Button size="sm" variant={attendanceFilter === 'ALL' ? 'primary' : 'ghost'} onClick={() => setAttendanceFilter('ALL')}>
                    Todas
                  </Button>
                  <Button size="sm" variant={attendanceFilter === 'PENDING' ? 'primary' : 'ghost'} onClick={() => setAttendanceFilter('PENDING')}>
                    Pendientes
                  </Button>
                  <Button size="sm" variant={attendanceFilter === 'ATTENDED' ? 'primary' : 'ghost'} onClick={() => setAttendanceFilter('ATTENDED')}>
                    Asistieron
                  </Button>
                </div>
              </div>
              {reservationContent}
            </div>
          )}
        </div>
      )}
    </DashboardTemplate>
  );
}
