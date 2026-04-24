import { Menu, ShoppingBag } from 'lucide-react';
import { isStaffUser, useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { useNavLayoutToggle } from '@/hooks/useNavLayoutToggle';

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const user = useAuthStore((s) => s.user);
  const showCart = !isStaffUser(user);
  const { toggle: toggleNav, isMobile } = useNavLayoutToggle();
  const { toggleCart, cartItems } = useUIStore();
  const cartCount = cartItems.length;

  return (
    <header className="h-16 flex items-center justify-between px-4 glass border-b border-white/30 shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleNav}
          className="p-2 rounded-xl hover:bg-white/50 text-text-secondary hover:text-text-primary transition-colors"
          aria-label={isMobile ? 'Abrir menú de navegación' : 'Plegar barra lateral'}
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1 className="font-display font-semibold text-text-primary text-lg">{title}</h1>
        )}
      </div>

      {showCart && (
        <button
          type="button"
          onClick={toggleCart}
          className="relative p-2 rounded-xl hover:bg-white/50 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Abrir carrito"
        >
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-primary text-white text-xs font-bold flex items-center justify-center">
              {cartCount > 9 ? '9+' : cartCount}
            </span>
          )}
        </button>
      )}
    </header>
  );
}
