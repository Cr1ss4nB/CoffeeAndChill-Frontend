import { Calendar, Users, Palette } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import type { Workshop } from '@/types';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

interface WorkshopCardProps {
  workshop: Workshop;
  onReserve?: (workshop: Workshop) => void;
  adminMode?: boolean;
}

export function WorkshopCard({ workshop, onReserve, adminMode }: WorkshopCardProps) {
  const spotsLeft = workshop.totalSpots - workshop.reservedSpots;
  const isFull = spotsLeft <= 0;

  return (
    <div className="glass p-5 card-hover flex flex-col">
      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-lavender/30 to-sage/30 flex items-center justify-center mb-4">
        <Palette size={40} className="text-text-secondary/40" />
      </div>

      <h3 className="font-display font-semibold text-lg text-text-primary">{workshop.name}</h3>
      <p className="text-xs text-text-secondary mt-1 flex-1">{workshop.description}</p>

      <div className="flex items-center gap-3 mt-3 text-xs text-text-secondary">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {format(new Date(workshop.date), "d 'de' MMM", { locale: es })} · {workshop.time}
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} />
          {spotsLeft} cupos
        </span>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="font-bold text-text-primary">{formatCOP(workshop.price)}</span>
        {isFull ? (
          <Badge className="bg-red-100/80 text-red-600">Lleno</Badge>
        ) : (
          onReserve && !adminMode && (
            <Button size="sm" onClick={() => onReserve(workshop)}>
              Reservar cupo
            </Button>
          )
        )}
      </div>
    </div>
  );
}
