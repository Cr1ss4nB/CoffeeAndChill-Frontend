import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag, X } from 'lucide-react';
import { CartItem } from '@/components/molecules/CartItem/CartItem';
import { Button } from '@/components/atoms/Button/Button';
import { useUIStore } from '@/store/ui.store';

export function CartDrawer() {
  const { cartOpen, closeCart, cartItems, getCartTotal, clearCart } = useUIStore();

  const total = getCartTotal();

  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(total);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={closeCart}
            aria-hidden="true"
          />

          <motion.aside
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 38 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm glass border-l border-white/30 z-50 flex flex-col shadow-2xl"
            aria-label="Carrito de compras"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-accent-primary" />
                <h2 className="font-display font-bold text-lg text-text-primary">Tu pedido</h2>
                {cartItems.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-accent-primary/10 text-accent-primary text-xs font-bold">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 rounded-xl hover:bg-white/50 text-text-secondary hover:text-text-primary transition-colors"
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-3">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                  <ShoppingBag size={48} className="text-text-secondary/20" />
                  <p className="text-text-secondary font-medium">Tu carrito está vacío</p>
                  <p className="text-sm text-text-secondary/60">
                    Agrega productos desde el menú
                  </p>
                </div>
              ) : (
                cartItems.map((item) => <CartItem key={item.cartItemId} item={item} />)
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="px-5 py-4 border-t border-white/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary font-medium">Total</span>
                  <span className="text-lg font-bold text-text-primary">{formattedTotal}</span>
                </div>

                <Button className="w-full" size="lg">
                  Realizar pedido
                </Button>
                <button
                  onClick={clearCart}
                  className="w-full text-xs text-text-secondary/60 hover:text-red-400 transition-colors py-1"
                >
                  Vaciar carrito
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
