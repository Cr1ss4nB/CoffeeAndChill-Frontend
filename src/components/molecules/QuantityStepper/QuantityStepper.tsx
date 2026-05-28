import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Restar"
        icon={<Minus size={13} />}
        className="!w-7 !h-7 !rounded-full !p-0 hover:bg-accent-primary hover:text-white hover:border-accent-primary"
      />
      <span className="w-5 text-center text-sm font-semibold text-text-primary tabular-nums">
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Sumar"
        icon={<Plus size={13} />}
        className="!w-7 !h-7 !rounded-full !p-0 hover:bg-accent-primary hover:text-white hover:border-accent-primary"
      />
    </div>
  );
}
