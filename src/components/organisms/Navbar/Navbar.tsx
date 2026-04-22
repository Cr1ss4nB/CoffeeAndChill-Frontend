import { Bell } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { useAuthStore } from '@/store/auth.store';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: Readonly<NavbarProps>) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="glass !rounded-2xl px-6 py-3 flex items-center justify-between mb-6 no-print">
      <h1 className="font-display text-xl font-bold text-text-primary">{title}</h1>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-xl hover:bg-white/30 transition-colors" aria-label="Notificaciones">
          <Bell size={20} className="text-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blush rounded-full" />
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
