import { OrderKanbanBoard } from '@/components/organisms/OrderKanbanBoard/OrderKanbanBoard';

export default function OrdersPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-primary mb-1">
          Gestión de pedidos
        </h1>
        <p className="text-text-secondary text-sm">
          Arrastra las tarjetas para cambiar el estado de cada pedido.
        </p>
      </div>
      <OrderKanbanBoard />
    </div>
  );
}
