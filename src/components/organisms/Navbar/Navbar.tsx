import { Bell } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { useInventory } from '@/hooks/useInventory';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: Readonly<NavbarProps>) {
  const user = useAuthStore((s) => s.user);
  const { data: inventoryData } = useInventory();
  const lowStockCount = inventoryData?.low_stock_count ?? 0;

  return (
    <header className="glass !rounded-2xl px-6 py-3 flex items-center justify-between mb-6 no-print">
      <h1 className="font-display text-xl font-bold text-text-primary">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-white/30 transition-colors" aria-label="Notificaciones">
          <Bell size={20} className="text-text-secondary" />
          {lowStockCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-blush text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white/20 animate-pulse">
              {lowStockCount}
            </span>
          )}
        </button>
        {user && (
          <div className="flex items-center gap-2">
            <Avatar name={user.name} size="sm" />
            <span className="text-sm font-medium text-text-primary hidden sm:block">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
}
