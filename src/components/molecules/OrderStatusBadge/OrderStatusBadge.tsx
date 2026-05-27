type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  PENDING:     { label: 'En espera',    classes: 'bg-lavender/50 text-purple-700 border-lavender/30' },
  PREPARING:   { label: 'Preparando',  classes: 'bg-peach/50 text-orange-700 border-peach/30' },
  READY:       { label: 'Listo',       classes: 'bg-sage/50 text-green-700 border-sage/30' },
  DELIVERED:   { label: 'Entregado',   classes: 'bg-cream/80 text-stone-600 border-cream/60' },
  CANCELLED:   { label: 'Cancelado',   classes: 'bg-red-50 text-red-500 border-red-200' },
};

interface OrderStatusBadgeProps {
  status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status as OrderStatus] ?? {
    label: status,
    classes: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.classes}`}>
      {config.label}
    </span>
  );
}
