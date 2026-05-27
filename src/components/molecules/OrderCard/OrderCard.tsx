import { ShoppingBag, Utensils, Package, ArrowRight, MessageSquare } from 'lucide-react';
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
  const isPreparing = order.status === 'PREPARING';
  const isReady = order.status === 'READY';

  const nextStatusLabel = isPending ? 'Iniciar preparación' : isPreparing ? 'Marcar listo' : isReady ? 'Entregado' : null;
  const nextStatusValue = isPending ? 'PREPARING' : isPreparing ? 'READY' : isReady ? 'DELIVERED' : null;
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
              Mesa {order.table_number ?? order.table_id}
              {order.table_code && <span className="text-xs font-normal text-text-secondary/60 ml-1">· {order.table_code}</span>}
            </p>
          ) : order.order_type === 'DINE_IN' ? (
            <p className="text-sm font-bold text-text-primary flex items-center gap-1">
              <Utensils size={14} className="text-purple-500" />
              En mesa
              <span className="text-[10px] font-normal text-purple-400 ml-1">· sin asignar</span>
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

      <ul className="space-y-1.5">
        {order.items.slice(0, 3).map((item) => (
          <li key={item.item_id} className="text-xs">
            <div className="flex justify-between">
              <span className="text-text-secondary truncate">
                {item.quantity}× {item.product_name ?? `#${item.product_id}`}
              </span>
              <span className="text-text-secondary/60 shrink-0 ml-2">
                ${item.subtotal.toLocaleString('es-CO')}
              </span>
            </div>
            {item.special_instructions && (
              <p className="mt-0.5 ml-3 text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md italic">
                {item.special_instructions}
              </p>
            )}
          </li>
        ))}
        {order.items.length > 3 && (
          <li className="text-xs text-text-secondary/50 italic">
            +{order.items.length - 3} más…
          </li>
        )}
      </ul>

      {/* Order-level notes */}
      {order.notes && (
        <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-lg bg-blue-50/60 border border-blue-100/60 text-[11px] text-blue-700">
          <MessageSquare size={11} className="shrink-0 mt-0.5" />
          <span className="italic">{order.notes}</span>
        </div>
      )}

      <div className="flex items-center justify-end pt-1 border-t border-white/20">
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
