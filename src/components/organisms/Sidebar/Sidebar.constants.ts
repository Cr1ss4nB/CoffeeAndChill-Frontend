import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  FlaskConical,
  CalendarDays,
  BookOpen,
  Users,
  QrCode,
  ListOrdered,
  FileEdit,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  navKey?: string;
  adminOnly?: boolean;
  staffOnly?: boolean;
  customerOnly?: boolean;
}

export const navItems: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: true },
  { to: '/orders', icon: UtensilsCrossed, label: 'Pedidos', staffOnly: true },
  { to: '/inventory', icon: Package, label: 'Inventario', staffOnly: true },
  { to: '/ingredients', icon: FlaskConical, label: 'Insumos', staffOnly: true },
  { to: '/products', icon: FileEdit, label: 'Editar carta', staffOnly: true, navKey: 'edit-carta' },
  { to: '/menu', icon: BookOpen, label: 'Menú', customerOnly: true, navKey: 'menu-cliente' },
  {
    to: '/menu',
    icon: Eye,
    label: 'Vista previa — carta',
    staffOnly: true,
    navKey: 'menu-vista',
  },
  { to: '/workshops', icon: CalendarDays, label: 'Talleres' },
  { to: '/employees', icon: Users, label: 'Empleados', adminOnly: true },
  { to: '/tables', icon: ListOrdered, label: 'Mesas', adminOnly: true },
  { to: '/qr', icon: QrCode, label: 'QR Mesas', adminOnly: true },
];
