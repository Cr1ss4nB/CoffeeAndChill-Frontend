import { AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge/Badge';
import { ColorSwatchKit } from '@/components/molecules/ColorSwatchKit/ColorSwatchKit';
import type { InventoryItem } from '@/types';

interface InventoryRowProps {
  item: InventoryItem;
  onEdit?: (item: InventoryItem) => void;
}

const statusConfig = {
  OK: { label: 'OK', className: 'bg-sage/60 text-green-700' },
  LOW: { label: 'Bajo', className: 'bg-peach/80 text-amber-700' },
  OUT: { label: 'Agotado', className: 'bg-red-100/80 text-red-600' },
};

export function InventoryRow({ item, onEdit }: InventoryRowProps) {
  const st = statusConfig[item.status];
  const isLow = item.status === 'LOW' || item.status === 'OUT';

  return (
    <div
      className={`glass !rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/70 transition-colors ${isLow ? '!bg-peach/20' : ''}`}
      onClick={() => onEdit?.(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEdit?.(item)}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-text-primary text-sm truncate">{item.name}</p>
          {item.volume && (
            <Badge className="bg-lavender/50 text-text-secondary text-[10px]">{item.volume}</Badge>
          )}
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{item.subcategory}</p>
        {item.colors && <ColorSwatchKit colors={item.colors} className="mt-2" />}
      </div>

      <div className="text-right flex items-center gap-3">
        <div>
          <p className="font-bold text-sm text-text-primary">
            {item.stock} {item.unit}
          </p>
        </div>
        <Badge className={st.className}>
          {item.status === 'LOW' && <AlertTriangle size={10} className="mr-1" />}
          {item.status === 'OUT' && <XCircle size={10} className="mr-1" />}
          {st.label}
        </Badge>
      </div>
    </div>
  );
}
