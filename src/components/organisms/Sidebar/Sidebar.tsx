import { LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLink } from '@/components/molecules/NavLink/NavLink';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { navItems } from '@/components/organisms/Sidebar/Sidebar.constants';
import logoSrc from '@/assets/foreground-1773528399195.png';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const role = user?.role ?? 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'EMPLOYEE' || role === 'ADMIN';

  const visibleLinks = navItems.filter((item) => {
    if (item.adminOnly) return isAdmin;
    // /orders and /inventory are staff-only
    if (item.to === '/orders' || item.to === '/inventory') return isStaff;
    return true;
  });

  return (
    <aside
      className={`flex flex-col h-full glass border-r border-white/30 transition-all duration-300 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20">
        <img
          src={logoSrc}
          alt="Coffee & Chill — logo"
          className="w-8 h-8 shrink-0 rounded-xl object-contain"
        />
        {sidebarOpen && (
          <span className="font-display font-bold text-text-primary truncate">CoffeeAndChill</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {visibleLinks.map((link) => (
          <NavLink key={link.to} {...link} collapsed={!sidebarOpen} />
        ))}
      </nav>

      {/* User info + acción de sesión */}
      <div className="p-3 border-t border-white/20 space-y-2">
        {sidebarOpen && user && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>
        )}

        {user ? (
          /* Usuario autenticado → Cerrar sesión */
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Cerrar sesión</span>}
          </button>
        ) : (
          /* Visitante sin sesión → Iniciar sesión */
          <Link
            to="/login"
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-text-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-colors ${
              !sidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogIn size={20} className="shrink-0" />
            {sidebarOpen && <span>Iniciar sesión</span>}
          </Link>
        )}
      </div>
    </aside>
  );
}
