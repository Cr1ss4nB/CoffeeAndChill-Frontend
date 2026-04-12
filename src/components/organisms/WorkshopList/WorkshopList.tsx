import { useState } from 'react';
import { WorkshopCard } from '@/components/molecules/WorkshopCard/WorkshopCard';
import { WorkshopBookingModal } from '@/components/organisms/WorkshopBookingModal/WorkshopBookingModal';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useWorkshops } from '@/hooks/useWorkshops';
import type { Workshop } from '@/types';

export function WorkshopList() {
  const { data: workshops, isLoading } = useWorkshops();
  const [selected, setSelected] = useState<Workshop | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12"><Spinner size="lg" /></div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {workshops?.map((w) => (
          <WorkshopCard key={w.id} workshop={w} onReserve={setSelected} />
        ))}
      </div>

      {selected && (
        <WorkshopBookingModal workshop={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
