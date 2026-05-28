import { Search, X } from 'lucide-react';
import { Input } from '@/components/atoms/Input/Input';
import { Button } from '@/components/atoms/Button/Button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/60 pointer-events-none z-10" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          icon={<X size={16} />}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 border-0 text-text-secondary/60 hover:text-text-primary !p-1"
        />
      )}
    </div>
  );
}
