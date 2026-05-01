import { useState } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { WorkshopCard } from '@/components/molecules/WorkshopCard/WorkshopCard';
import { WorkshopBookingModal } from '@/components/organisms/WorkshopBookingModal/WorkshopBookingModal';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useWorkshops } from '@/hooks/useWorkshops';
import type { Workshop } from '@/types';

interface WorkshopListProps {
  adminMode?: boolean;
  searchTerm?: string;
}

export function WorkshopList({ adminMode, searchTerm = '' }: WorkshopListProps) {
  const { data: workshops, isLoading, isError } = useWorkshops();
  const [selected, setSelected] = useState<Workshop | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredWorkshops = (workshops || [])
    .filter((w) => w.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((w) => (onlyAvailable ? w.reservedSpots < w.totalSpots : true));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500 bg-red-50 rounded-xl">
        Error al cargar los talleres. Por favor intenta de nuevo.
      </div>
    );
  }

  if (!workshops || workshops.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay talleres disponibles</div>;
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          variant={onlyAvailable ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setOnlyAvailable((prev) => !prev)}
        >
          Solo con cupos
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkshops.map((w) => (
          <WorkshopCard key={w.id} workshop={w} onReserve={setSelected} adminMode={adminMode} />
        ))}
      </div>

      {filteredWorkshops.length === 0 && (
        <p className="text-center py-8 text-text-secondary">No hay talleres que coincidan con los filtros</p>
      )}

      {!adminMode && selected && (
        <WorkshopBookingModal workshop={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
