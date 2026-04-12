import { Coffee, Clock, ChefHat, CheckCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/atoms/Button/Button';
import type { OrderStatus } from '@/types';

// Accepts the order object directly to avoid coupling to a specific polling hook.
// The parent (MenuPage or OrderStatusPage) is responsible for fetching the order.
interface OrderStatusTrackerProps {
  order: { status: OrderStatus; orderNumber?: number; items?: Array<{ id: string; productName: string; quantity: number; notes?: string }> } | null;
  isLoading?: boolean;
  tableNumber?: number;
  onNewOrder: () => void;
}

const steps: { status: OrderStatus; label: string; description: string; icon: typeof Clock }[] = [
  {
    status: 'PENDING',
    label: 'Recibido',
    description: 'Tu pedido está en la fila. Lo prepararemos muy pronto.',
    icon: Clock,
  },
  {
    status: 'IN_PROGRESS',
    label: 'En preparación',
    description: '¡Estamos preparando tu pedido con mucho cariño!',
    icon: ChefHat,
  },
  {
    status: 'COMPLETED',
    label: '¡Listo!',
    description: 'Tu pedido está listo. Pasa a recogerlo en la barra.',
    icon: CheckCircle,
  },
];

const statusIndex: Record<OrderStatus, number> = {
  PENDING: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
};

export function OrderStatusTracker({ order, isLoading = false, tableNumber, onNewOrder }: OrderStatusTrackerProps) {
  const currentIndex = order ? statusIndex[order.status] : 0;
  const isDone = order?.status === 'COMPLETED';

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-8 flex flex-col items-center">
        {/* Brand mark */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blush to-lavender flex items-center justify-center mb-4 shadow-md">
          <Coffee size={28} className="text-white" />
        </div>

        <h1 className="font-display text-2xl font-bold text-text-primary mb-1">Tu Pedido</h1>

        {tableNumber && (
          <p className="text-xs text-text-secondary bg-lavender/30 px-3 py-1 rounded-lg mb-2">
            Mesa {tableNumber}
          </p>
        )}

        {order?.orderNumber && (
          <p className="text-xs text-text-secondary mb-6">Pedido #{order.orderNumber}</p>
        )}

        {/* Stepper */}
        <div className="w-full flex items-center mb-8">
          {steps.map((step, i) => {
            const isCompleted = !isLoading && i < currentIndex;
            const isActive = !isLoading && i === currentIndex;
            const StepIcon = step.icon;

            return (
              <div key={step.status} className="flex items-center flex-1 last:flex-none">
                {/* Step circle */}
                <div className="flex flex-col items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500
                      ${isLoading ? 'skeleton' : ''}
                      ${isCompleted
                        ? 'bg-gradient-to-br from-blush to-lavender shadow-md'
                        : isActive
                        ? 'bg-gradient-to-br from-blush to-lavender shadow-md animate-pulse'
                        : 'bg-white/40 border-2 border-white/40'
                      }
                    `}
                  >
                    {!isLoading && (
                      isCompleted
                        ? <Check size={18} className="text-white" />
                        : <StepIcon size={18} className={isActive ? 'text-white' : 'text-text-secondary/50'} />
                    )}
                  </div>
                  <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                    isActive ? 'text-text-primary' : isCompleted ? 'text-text-secondary' : 'text-text-secondary/50'
                  }`}>
                    {step.label}
                  </span>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-5 relative">
                    <div className="absolute inset-0 bg-white/30 rounded-full" />
                    {!isLoading && i < currentIndex && (
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute inset-0 bg-gradient-to-r from-blush to-lavender rounded-full origin-left"
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Status message */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <div className="text-center mb-6">
              <div className="h-5 w-36 skeleton rounded-lg mx-auto mb-2" />
              <div className="h-4 w-52 skeleton rounded-lg mx-auto" />
            </div>
          ) : order ? (
            <motion.div
              key={order.status}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center mb-6"
            >
              {isDone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sage/40 to-sage/20 flex items-center justify-center mx-auto mb-3"
                >
                  <CheckCircle size={28} className="text-green-600" />
                </motion.div>
              )}
              <h2 className="font-display text-xl font-bold text-text-primary mb-1">
                {order.status === 'COMPLETED'
                  ? '¡Tu pedido está listo!'
                  : order.status === 'PENDING'
                  ? 'Pedido recibido'
                  : 'En preparación'}
              </h2>
              <p className="text-sm text-text-secondary leading-relaxed">
                {steps[currentIndex].description}
              </p>
            </motion.div>
          ) : (
            <p className="text-sm text-text-secondary mb-6">Cargando estado del pedido...</p>
          )}
        </AnimatePresence>

        {/* Order summary */}
        {order?.items && order.items.length > 0 && (
          <div className="w-full glass-subtle rounded-xl p-4 mb-6 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="flex-1">
                  <span className="text-text-primary font-medium">
                    {item.quantity}× {item.productName}
                  </span>
                  {item.notes && (
                    <p className="text-xs text-text-secondary/70 italic mt-0.5">"{item.notes}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant={isDone ? 'primary' : 'ghost'}
          className="w-full"
          onClick={onNewOrder}
        >
          {isDone ? 'Hacer otro pedido' : 'Nuevo pedido'}
        </Button>

        {!isDone && (
          <p className="text-xs text-text-secondary/60 mt-3 text-center">
            Esta página se actualiza automáticamente
          </p>
        )}
      </div>
    </div>
  );
}
