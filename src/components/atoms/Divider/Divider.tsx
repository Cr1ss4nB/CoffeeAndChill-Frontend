interface DividerProps {
  className?: string;
  label?: string;
}

export function Divider({ className = '', label }: DividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-3 my-4 ${className}`}>
        <div className="flex-1 h-px bg-white/30" />
        <span className="text-xs text-text-secondary">{label}</span>
        <div className="flex-1 h-px bg-white/30" />
      </div>
    );
  }

  return <div className={`h-px bg-white/30 my-4 ${className}`} />;
}
