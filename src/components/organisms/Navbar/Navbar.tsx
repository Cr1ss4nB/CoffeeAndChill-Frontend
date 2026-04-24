import { Bell, Menu } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { useNavLayoutToggle } from '@/hooks/useNavLayoutToggle';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: Readonly<NavbarProps>) {
  const user = useAuthStore((s) => s.user);
  const { toggle } = useNavLayoutToggle();

  return (
    <header className="glass !rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3 mb-6 no-print">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={toggle}
          className="md:hidden shrink-0 p-2 -ml-1 rounded-xl hover:bg-white/30 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Abrir o cerrar la navegación"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-display text-lg sm:text-xl font-bold text-text-primary truncate">{title}</h1>
      </div>
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
