import { Clock, ShoppingBag, Utensils, Package, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { OrderStatusBadge } from '@/components/molecules/OrderStatusBadge/OrderStatusBadge';
import type { BoardOrder } from '@/hooks/useOrdersBoard';

interface OrderCardProps {
  order: BoardOrder;
  onStatusChange?: (orderId: number, newStatus: string) => void;
}

export function OrderCard({ order, onStatusChange }: Readonly<OrderCardProps>) {
  const isPending = order.status === 'PENDING';
  const isInProgress = order.status === 'IN_PROGRESS';

  const nextStatusLabel = isPending ? 'Preparar' : isInProgress ? 'Terminar' : null;
  const nextStatusValue = isPending ? 'IN_PROGRESS' : isInProgress ? 'COMPLETED' : null;
  const sortableId = `order-${order.order_id}`;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: sortableId,
    data: {
      type: 'order',
      orderId: order.order_id,
      status: order.status,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  };

  const timeAgo = formatDistanceToNow(new Date(order.order_date), {
    addSuffix: true,
    locale: es,
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="glass rounded-2xl p-4 space-y-3 hover:border-accent-primary/20 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-text-secondary/60 font-medium">Pedido #{order.order_id}</p>
          {order.table_id ? (
            <p className="text-sm font-bold text-text-primary flex items-center gap-1">
              <Utensils size={14} className="text-accent-primary" />
              Mesa {order.table_id}
            </p>
          ) : (
            <p className="text-sm font-bold text-text-primary flex items-center gap-1">
              <Package size={14} className="text-accent-primary" />
              Para llevar
            </p>
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

      {nextStatusValue && onStatusChange && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange(order.order_id, nextStatusValue);
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-accent-primary/10 hover:bg-accent-primary text-accent-primary hover:text-white transition-all text-xs font-bold border border-accent-primary/20"
        >
          {nextStatusLabel}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}
