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
        `flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
          isActive
            ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/25'
            : 'text-text-secondary hover:bg-white/50 hover:text-text-primary'
        }`
      }
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </RouterNavLink>
  );
}
