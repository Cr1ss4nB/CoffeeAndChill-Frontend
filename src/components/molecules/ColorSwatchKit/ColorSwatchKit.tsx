interface ColorSwatchKitProps {
  colors: string[];
  className?: string;
}

export function ColorSwatchKit({ colors, className = '' }: ColorSwatchKitProps) {
  return (
    <div className={`flex gap-1.5 ${className}`}>
      {colors.map((color, i) => (
        <div
          key={i}
          className="w-5 h-5 rounded-full ring-1 ring-white/60 shadow-sm"
          style={{ backgroundColor: color }}
          aria-label={`Color ${i + 1}`}
        />
      ))}
    </div>
  );
}
