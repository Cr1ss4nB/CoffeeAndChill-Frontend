import { LayoutDashboard, UtensilsCrossed, Package, CalendarDays, BookOpen, Users, QrCode, Archive, ListOrdered } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  adminOnly: boolean;
}

export const navItems: NavItem[] = [
  { to: '/menu',       icon: BookOpen,         label: 'Menú',       adminOnly: false },
  { to: '/workshops',  icon: CalendarDays,     label: 'Talleres',   adminOnly: false },
  { to: '/orders',     icon: UtensilsCrossed,  label: 'Pedidos',    adminOnly: false },
  { to: '/inventory',  icon: Package,          label: 'Inventario', adminOnly: false },
  { to: '/products',   icon: Archive,          label: 'Productos',  adminOnly: false },
  { to: '/dashboard',  icon: LayoutDashboard,  label: 'Dashboard',  adminOnly: true  },
  { to: '/employees',  icon: Users,            label: 'Empleados',  adminOnly: true  },
  { to: '/tables',     icon: ListOrdered,      label: 'Mesas',      adminOnly: true  },
  { to: '/qr',         icon: QrCode,           label: 'QR Mesas',   adminOnly: true  },
];
