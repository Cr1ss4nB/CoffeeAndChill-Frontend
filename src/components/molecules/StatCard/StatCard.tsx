import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  accentColor?: string;
}

export function StatCard({ icon: IconComp, value, label, accentColor = 'bg-blush/30' }: StatCardProps) {
  return (
    <div className="glass p-5 card-hover">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl ${accentColor} flex items-center justify-center`}>
          <IconComp size={22} className="text-text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold font-display text-text-primary">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}
