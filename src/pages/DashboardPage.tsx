import { ClipboardList, Clock, AlertTriangle, Palette, Plus, CalendarPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { StatCard } from '@/components/molecules/StatCard/StatCard';
import { OrderStatusBadge } from '@/components/molecules/OrderStatusBadge/OrderStatusBadge';
import { Button } from '@/components/atoms/Button/Button';
import { useOrdersBoard } from '@/hooks/useOrdersBoard';
import { useInventory } from '@/hooks/useInventory';
import { useWorkshops } from '@/hooks/useWorkshops';

function formatCOP(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { data: orders } = useOrdersBoard();
  const { data: inventoryData } = useInventory();
  const { data: workshops } = useWorkshops();
  const navigate = useNavigate();

  const todayOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.status === 'PENDING').length || 0;
  const lowStock = inventoryData?.low_stock_count ?? 0;
  const activeWorkshops = workshops?.filter((w) => new Date(w.date) >= new Date()).length || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  return (
    <DashboardTemplate title="Dashboard">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={ClipboardList} value={todayOrders} label="Pedidos hoy" accentColor="bg-sky/30" />
        <StatCard icon={Clock} value={pendingOrders} label="En espera" accentColor="bg-peach/40" />
        <StatCard icon={AlertTriangle} value={lowStock} label="Stock bajo" accentColor="bg-blush/40" />
        <StatCard icon={Palette} value={activeWorkshops} label="Talleres activos" accentColor="bg-sage/30" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders */}
        <div className="lg:col-span-2 glass p-5">
          <h2 className="font-display font-bold text-text-primary mb-4">Pedidos Recientes</h2>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <div key={order.order_id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="font-display font-bold text-sm text-text-primary">#{order.order_id}</span>
                  <span className="text-xs bg-lavender/30 px-2 py-0.5 rounded-lg text-text-secondary">
                    Mesa {order.table_id ?? '—'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-text-primary">{formatCOP(order.total_amount)}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && (
              <p className="text-center text-text-secondary py-4 text-sm">No hay pedidos aún</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="glass p-5">
          <h2 className="font-display font-bold text-text-primary mb-4">Acciones Rápidas</h2>
          <div className="space-y-3">
            <Button className="w-full justify-start" icon={<Plus size={18} />} onClick={() => navigate('/orders')}>
              Nuevo Pedido
            </Button>
            <Button className="w-full justify-start" variant="ghost" icon={<CalendarPlus size={18} />} onClick={() => navigate('/workshops')}>
              Nueva Reserva
            </Button>
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}
