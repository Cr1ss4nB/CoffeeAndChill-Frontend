import { LayoutDashboard, UtensilsCrossed, Package, CalendarDays, BookOpen, LogOut } from 'lucide-react';
import { NavLink } from '@/components/molecules/NavLink/NavLink';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';

const customerLinks = [
  { to: '/menu', icon: BookOpen, label: 'Menú' },
  { to: '/workshops', icon: CalendarDays, label: 'Talleres' },
];

const employeeLinks = [
  { to: '/orders', icon: UtensilsCrossed, label: 'Pedidos' },
  { to: '/inventory', icon: Package, label: 'Inventario' },
];

const adminLinks = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const role = user?.role ?? 'CUSTOMER';

  const links = [
    ...customerLinks,
    ...(role === 'EMPLOYEE' || role === 'ADMIN' ? employeeLinks : []),
    ...(role === 'ADMIN' ? adminLinks : []),
  ];

  return (
    <aside
      className={`flex flex-col h-full glass border-r border-white/30 transition-all duration-300 ${
        sidebarOpen ? 'w-60' : 'w-16'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20">
        <div className="w-8 h-8 shrink-0 rounded-xl bg-accent-primary flex items-center justify-center text-white font-bold text-sm">
          C
        </div>
        {sidebarOpen && (
          <span className="font-display font-bold text-text-primary truncate">CoffeeAndChill</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink key={link.to} {...link} collapsed={!sidebarOpen} />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-white/20 space-y-2">
        {sidebarOpen && user && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
            <p className="text-xs text-text-secondary truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors ${
            !sidebarOpen ? 'justify-center' : ''
          }`}
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
