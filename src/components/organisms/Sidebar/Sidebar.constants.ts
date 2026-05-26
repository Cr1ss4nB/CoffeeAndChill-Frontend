import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  FlaskConical,
  CalendarDays,
  BookOpen,
  Users,
  ListOrdered,
  Eye,
  Tags,
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
  { to: '/orders', icon: UtensilsCrossed, label: 'Panel de Pedidos', staffOnly: true },
  { to: '/inventory', icon: Package, label: 'Gestión de Almacén', staffOnly: true },
  { to: '/ingredients', icon: FlaskConical, label: 'Insumos', staffOnly: true },
  { to: '/categories', icon: Tags, label: 'Categorías', adminOnly: true },
  { to: '/menu', icon: BookOpen, label: 'Menú Cliente', customerOnly: true, navKey: 'menu-cliente' },
  {
    to: '/menu',
    icon: Eye,
    label: 'Vista Previa Menú',
    staffOnly: true,
    navKey: 'menu-vista',
  },
  { to: '/workshops', icon: CalendarDays, label: 'Talleres y Eventos' },
  { to: '/employees', icon: Users, label: 'Recursos Humanos', adminOnly: true },
  { to: '/tables', icon: ListOrdered, label: 'Gestión de Mesas', adminOnly: true },
  { to: '/analytics', icon: LayoutDashboard, label: 'Análisis de Negocio', adminOnly: true },
];
