import { NavLink as RouterNavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
}

export function NavLink({ to, icon: Icon, label, collapsed }: NavLinkProps) {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
          isActive
            ? 'bg-accent-primary/15 text-accent-primary font-semibold ring-1 ring-accent-primary/25 shadow-sm'
            : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Barra izquierda de página activa */}
          {isActive && (
            <span className="absolute left-0 inset-y-2 w-[3px] bg-accent-primary rounded-r-full" />
          )}
          <Icon size={20} className="shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </RouterNavLink>
  );
}
