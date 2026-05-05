import { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  TrendingUp, Package, ShoppingBag, AlertTriangle, 
  RefreshCw, Download, ExternalLink, Calendar
} from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { useInventory } from '@/hooks/useInventory';
import { useOrdersBoard } from '@/hooks/useOrdersBoard';
import { PowerBIVisual } from '@/components/organisms/PowerBIVisual/PowerBIVisual';

const COLORS = ['#FFC0CB', '#87CEEB', '#E6E6FA', '#F5F5DC', '#FFDAB9'];

export default function AnalyticsPage() {
  const { data: inventoryData } = useInventory();
  const { data: ordersData } = useOrdersBoard();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock Power BI URL
  const PBI_URL = "https://app.powerbi.com/view?r=eyJrIjoiYTMxYzYwMTYtMmZlYS00NmUzLTk4MmEtYjM0YzYwNmZlZDE0IiwidCI6IjY3ZGU0Y2FmLWRhNGYtNDFiOC1hYjE2LTljMmYyZGVhYmI2MCIsImMiOjR9";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Process Inventory Data
  const inventoryChartData = useMemo(() => {
    if (!inventoryData?.items) return [];
    return inventoryData.items.slice(0, 8).map(item => ({
      name: item.name.length > 12 ? item.name.substring(0, 10) + '...' : item.name,
      stock: item.stock,
      min: item.minStock
    }));
  }, [inventoryData]);

  // Process Category Distribution
  const categoryData = useMemo(() => {
    if (!inventoryData?.items) return [];
    const counts: Record<string, number> = {};
    inventoryData.items.forEach(item => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [inventoryData]);

  // Statistics
  const stats = {
    totalSales: ordersData?.reduce((acc, o) => acc + o.total_amount, 0) || 0,
    totalOrders: ordersData?.length || 0,
    lowStockItems: inventoryData?.low_stock_count || 0,
    growth: "+14.2%"
  };

  return (
    <DashboardTemplate title="Análisis y Reportes">
      <div className="space-y-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-text-secondary text-sm">Resumen de actividad hasta hoy</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="ghost" icon={<RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />} onClick={handleRefresh}>Refrescar</Button>
            <Button variant="ghost" icon={<Download size={16} />}>Exportar</Button>
            <Button icon={<Calendar size={16} />}>Últimos 30 días</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Ventas Totales" 
            value={`$${stats.totalSales.toLocaleString()}`} 
            icon={<TrendingUp className="text-sage-700" />} 
            trend="+12%" 
            color="bg-sage/30" 
          />
          <StatCard 
            title="Pedidos Realizados" 
            value={stats.totalOrders} 
            icon={<ShoppingBag className="text-sky-700" />} 
            trend="+5%" 
            color="bg-sky/30" 
          />
          <StatCard 
            title="Stock Bajo" 
            value={stats.lowStockItems} 
            icon={<AlertTriangle className="text-red-700" />} 
            trend="Atención" 
            color="bg-blush/30" 
          />
          <StatCard 
            title="Crecimiento" 
            value={stats.growth} 
            icon={<Package className="text-lavender-700" />} 
            trend="Mensual" 
            color="bg-lavender/30" 
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Inventory Bar Chart */}
          <div className="glass p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Nivel de Inventario vs Mínimo</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={inventoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: 'rgba(255,192,203,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="stock" name="Stock Actual" fill="#87CEEB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="min" name="Mínimo Requerido" fill="#FFC0CB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Distribution Pie Chart */}
          <div className="glass p-6">
            <h3 className="text-lg font-bold text-text-primary mb-6">Distribución por Categoría</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Power BI Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-text-primary">Dashboard Avanzado (Power BI)</h3>
            <Button variant="ghost" size="sm" icon={<ExternalLink size={14} />} onClick={() => window.open(PBI_URL, '_blank')}>
              Pantalla Completa
            </Button>
          </div>
          <div className="glass p-2">
            <PowerBIVisual embedUrl={PBI_URL} title="Reporte Completo Coffee & Chill" />
          </div>
        </div>
      </div>
    </DashboardTemplate>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <div className="glass p-5 flex items-center gap-4 hover:shadow-lg transition-all duration-300">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-text-secondary font-medium uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
          <span className="text-[10px] font-bold text-sage-700 bg-sage/20 px-1.5 py-0.5 rounded uppercase">
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}
