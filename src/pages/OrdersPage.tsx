import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { OrderKanbanBoard } from '@/components/organisms/OrderKanbanBoard/OrderKanbanBoard';

export default function OrdersPage() {
  return (
    <DashboardTemplate title="Pedidos">
      <div className="mb-4">
        <p className="text-text-secondary text-sm">Arrastra las tarjetas para cambiar el estado de cada pedido.</p>
      </div>
      <OrderKanbanBoard />
    </DashboardTemplate>
  );
}
