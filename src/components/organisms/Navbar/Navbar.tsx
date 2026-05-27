import { Bell, Menu, AlertTriangle, PackageX, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useIngredients } from '@/hooks/useIngredients';

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: Readonly<NavbarProps>) {
  const user = useAuthStore((s) => s.user);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { data: ingredients } = useIngredients(true);
  const alertItems = (ingredients ?? []).filter((i) => i.is_low_stock || i.current_stock === 0);
  const lowStockCount = alertItems.length;

  const [open, setOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        bellRef.current && !bellRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const dropdown = open ? (
    <div
      ref={dropdownRef}
      style={{ position: 'fixed', top: 72, right: 16, zIndex: 9999, width: 320 }}
      className="glass !rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/30">
        <p className="font-bold text-sm text-text-primary">
          Insumos con stock bajo
          {lowStockCount > 0 && (
            <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blush text-text-primary">{lowStockCount}</span>
          )}
        </p>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/40">
          <X size={14} className="text-text-secondary" />
        </button>
      </div>

      {alertItems.length === 0 ? (
        <p className="px-4 py-6 text-sm text-center text-text-secondary">Todo el stock está en orden ✓</p>
      ) : (
        <ul className="max-h-72 overflow-y-auto divide-y divide-white/20">
          {alertItems.map((item) => {
            const isOut = item.current_stock === 0;
            return (
              <li key={item.ingredient_id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/40 transition-colors">
                <span className={`shrink-0 p-1.5 rounded-lg ${isOut ? 'bg-red-100/70 text-red-600' : 'bg-blush/60 text-amber-700'}`}>
                  {isOut ? <PackageX size={14} /> : <AlertTriangle size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">{item.name}</p>
                  <p className="text-xs text-text-secondary">
                    Stock: <strong>{item.current_stock} {item.unit}</strong>
                    {item.min_stock > 0 && <span className="ml-1 opacity-60">· mín {item.min_stock}</span>}
                  </p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${isOut ? 'bg-red-100/70 text-red-600' : 'bg-blush/60 text-amber-700'}`}>
                  {isOut ? 'Agotado' : 'Bajo'}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <div className="px-4 py-3 border-t border-white/30">
        <button
          onClick={() => { setOpen(false); navigate('/ingredients'); }}
          className="w-full text-xs text-center text-accent-primary font-medium hover:underline"
        >
          Ver todos los insumos →
        </button>
      </div>
    </div>
  ) : null;

  return (
    <header className="glass !rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between gap-3 mb-6 no-print">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <button
          type="button"
          onClick={toggleSidebar}
          className="md:hidden shrink-0 p-2 -ml-1 rounded-xl hover:bg-white/30 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Abrir o cerrar la navegación"
        >
          <Menu size={22} />
        </button>
        <h1 className="font-display text-lg sm:text-xl font-bold text-text-primary truncate">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          ref={bellRef}
          onClick={() => setOpen((v) => !v)}
          className="relative p-2 rounded-xl hover:bg-white/30 transition-colors"
          aria-label="Notificaciones"
        >
          <Bell size={20} className="text-text-secondary" />
          {lowStockCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-blush text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white/20 animate-pulse">
              {lowStockCount}
            </span>
          )}
        </button>

        {createPortal(dropdown, document.body)}

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
