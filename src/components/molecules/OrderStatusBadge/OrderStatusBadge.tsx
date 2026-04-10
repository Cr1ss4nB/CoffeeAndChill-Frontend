type OrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusConfig: Record<OrderStatus, { label: string; classes: string }> = {
  PENDING:     { label: 'En espera',  classes: 'bg-amber-50 text-amber-600 border-amber-200' },
  IN_PROGRESS: { label: 'En proceso', classes: 'bg-blue-50 text-blue-600 border-blue-200' },
  COMPLETED:   { label: 'Terminado',  classes: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  CANCELLED:   { label: 'Cancelado',  classes: 'bg-red-50 text-red-500 border-red-200' },
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
