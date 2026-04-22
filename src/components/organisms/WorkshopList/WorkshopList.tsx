import { useState } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { WorkshopCard } from '@/components/molecules/WorkshopCard/WorkshopCard';
import { WorkshopBookingModal } from '@/components/organisms/WorkshopBookingModal/WorkshopBookingModal';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useWorkshops } from '@/hooks/useWorkshops';
import type { Workshop } from '@/types';

interface WorkshopListProps {
  adminMode?: boolean;
}

export function WorkshopList({ adminMode }: WorkshopListProps = {}) {
  const { data: workshops, isLoading } = useWorkshops();
  const [selected, setSelected] = useState<Workshop | null>(null);
  const [search, setSearch] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredWorkshops = (workshops || [])
    .filter((w) => w.name.toLowerCase().includes(search.toLowerCase()))
    .filter((w) => (onlyAvailable ? w.reservedSpots < w.totalSpots : true));

  if (isLoading) {
    return (
      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    );
  }

  if (!workshops || workshops.length === 0) {
    return <div className="text-center py-8 text-gray-500">No hay talleres disponibles</div>;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar taller..." />
        </div>
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
