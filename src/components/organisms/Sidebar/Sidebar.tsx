import { useEffect } from 'react';
import { LogOut, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NavLink } from '@/components/molecules/NavLink/NavLink';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { navItems } from '@/components/organisms/Sidebar/Sidebar.constants';
import { useIsMobile } from '@/hooks/useIsMobile';
import logoSrc from '@/assets/foreground-1773528399195.png';

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const mobileNavOpen = useUIStore((s) => s.mobileNavOpen);
  const closeMobileNav = useUIStore((s) => s.closeMobileNav);
  const isMobile = useIsMobile();

  const role = user?.role ?? 'CUSTOMER';
  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'EMPLOYEE' || role === 'ADMIN';

  const visibleLinks = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.staffOnly && !isStaff) return false;
    if (item.customerOnly && isStaff) return false;
    return true;
  });

  const collapsed = !sidebarOpen && !isMobile;
  const showText = sidebarOpen || isMobile;

  useEffect(() => {
    if (!isMobile) {
      closeMobileNav();
    }
  }, [isMobile, closeMobileNav]);

  useEffect(() => {
    if (!isMobile || !mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, mobileNavOpen]);

  useEffect(() => {
    if (!isMobile || !mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMobileNav();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMobile, mobileNavOpen, closeMobileNav]);

  const mobileTransform =
    isMobile && !mobileNavOpen ? 'max-md:-translate-x-full' : 'max-md:translate-x-0';

  return (
    <>
      {isMobile && mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] md:hidden"
          aria-label="Cerrar menú"
          onClick={closeMobileNav}
        />
      )}

      <aside
        className={[
          'flex flex-col h-full max-h-dvh glass border-r border-white/30',
          'max-md:fixed max-md:top-0 max-md:left-0 max-md:z-50 max-md:shadow-2xl max-md:w-64',
          'max-md:transition-transform max-md:duration-300',
          mobileTransform,
          'md:relative md:translate-x-0 md:transition-all md:duration-300',
          sidebarOpen ? 'md:w-60' : 'md:w-16',
        ].join(' ')}
        aria-hidden={isMobile && !mobileNavOpen ? true : undefined}
      >
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/20">
          <img
            src={logoSrc}
            alt="Coffee & Chill — logo"
            className="w-8 h-8 shrink-0 rounded-xl object-contain"
          />
          {showText && (
            <span className="font-display font-bold text-text-primary truncate">CoffeeAndChill</span>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.navKey ?? link.to}
              to={link.to}
              icon={link.icon}
              label={link.label}
              collapsed={collapsed}
              onNavigate={isMobile ? closeMobileNav : undefined}
            />
          ))}
        </nav>

        <div className="p-3 border-t border-white/20 space-y-2">
          {showText && user && (
            <div className="px-4 py-2">
              <p className="text-xs font-medium text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-text-secondary truncate">{user.email}</p>
            </div>
          )}

          {user ? (
            <button
              type="button"
              onClick={logout}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-text-secondary hover:bg-red-50 hover:text-red-500 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut size={20} className="shrink-0" />
              {showText && <span>Cerrar sesión</span>}
            </button>
          ) : (
            <Link
              to="/login"
              onClick={isMobile ? closeMobileNav : undefined}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-text-secondary hover:bg-accent-primary/10 hover:text-accent-primary transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <LogIn size={20} className="shrink-0" />
              {showText && <span>Iniciar sesión</span>}
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
