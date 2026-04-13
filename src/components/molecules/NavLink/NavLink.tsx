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
            ? 'bg-gradient-to-r from-blush to-lavender text-text-primary font-semibold shadow-sm ring-1 ring-white/60'
            : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Barra izquierda — degradado blush→lavender */}
          {isActive && (
            <span className="absolute left-0 inset-y-2 w-[3px] bg-gradient-to-b from-blush to-lavender rounded-r-full" />
          )}
          <Icon size={20} className="shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </RouterNavLink>
  );
}
