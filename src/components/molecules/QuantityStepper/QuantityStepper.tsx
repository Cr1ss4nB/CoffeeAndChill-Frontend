import { Minus, Plus } from 'lucide-react';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99 }: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-7 h-7 rounded-full flex items-center justify-center border border-white/40 text-text-secondary hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Restar"
      >
        <Minus size={13} />
      </button>
      <span className="w-5 text-center text-sm font-semibold text-text-primary tabular-nums">
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-7 h-7 rounded-full flex items-center justify-center border border-white/40 text-text-secondary hover:bg-accent-primary hover:text-white hover:border-accent-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Sumar"
      >
        <Plus size={13} />
      </button>
    </div>
  );
}
