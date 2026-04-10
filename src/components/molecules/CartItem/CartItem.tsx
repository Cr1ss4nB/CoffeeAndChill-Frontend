import { Trash2 } from 'lucide-react';
import { QuantityStepper } from '@/components/molecules/QuantityStepper/QuantityStepper';
import { useUIStore } from '@/store/ui.store';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateCartQuantity, removeFromCart } = useUIStore();

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(item.product.price * item.quantity);

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/20 last:border-0">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blush/30 to-lavender/30 flex items-center justify-center shrink-0 font-display font-bold text-text-secondary">
        {item.product.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">{item.product.name}</p>

        {item.customizations && (
          <p className="text-xs text-text-secondary/70 mt-0.5">
            {Object.values(item.customizations as Record<string, string>)
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) => updateCartQuantity(item.cartItemId, qty)}
          />
          <span className="text-sm font-bold text-accent-primary">{formattedPrice}</span>
        </div>
      </div>

      <button
        onClick={() => removeFromCart(item.cartItemId)}
        className="p-1.5 rounded-lg text-text-secondary/50 hover:text-red-400 hover:bg-red-50 transition-colors mt-0.5"
        aria-label="Remove item"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
