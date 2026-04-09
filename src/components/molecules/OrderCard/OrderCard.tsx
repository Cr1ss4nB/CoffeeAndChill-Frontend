import { Clock, ShoppingBag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { OrderStatusBadge } from '@/components/molecules/OrderStatusBadge/OrderStatusBadge';
import type { BoardOrder } from '@/hooks/useOrdersBoard';

interface OrderCardProps {
  order: BoardOrder;
  onStatusChange?: (orderId: number, newStatus: string) => void;
}

export function OrderCard({ order }: OrderCardProps) {
  const timeAgo = formatDistanceToNow(new Date(order.order_date), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div className="glass rounded-2xl p-4 space-y-3 hover:border-accent-primary/20 transition-colors cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-secondary/60 font-medium">Pedido #{order.order_id}</p>
          {order.table_id && (
            <p className="text-sm font-bold text-text-primary">Mesa {order.table_id}</p>
          )}
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-text-secondary">
        <ShoppingBag size={13} />
        <span>
          {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      <ul className="space-y-1">
        {order.items.slice(0, 3).map((item) => (
          <li key={item.item_id} className="flex justify-between text-xs">
            <span className="text-text-secondary truncate">{item.quantity}× Producto #{item.product_id}</span>
            <span className="text-text-secondary/60 shrink-0 ml-2">
              ${item.subtotal.toLocaleString('es-CO')}
            </span>
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="text-xs text-text-secondary/50 italic">
            +{order.items.length - 3} más…
          </li>
        )}
      </ul>

      <div className="flex items-center justify-between pt-1 border-t border-white/20">
        <div className="flex items-center gap-1 text-xs text-text-secondary/60">
          <Clock size={11} />
          <span>{timeAgo}</span>
        </div>
        <span className="text-sm font-bold text-accent-primary">
          ${order.total_amount.toLocaleString('es-CO')}
        </span>
      </div>
    </div>
  );
}
