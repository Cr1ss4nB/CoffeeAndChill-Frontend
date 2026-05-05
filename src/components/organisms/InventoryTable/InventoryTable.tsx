import { useState } from 'react';
import { Package, Palette, Plus, X, Clock, ShoppingBag } from 'lucide-react';
import { InventoryRow } from '@/components/molecules/InventoryRow/InventoryRow';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useInventory, useCreateInventoryItem, useAdjustInventoryItem, useInventoryMovements } from '@/hooks/useInventory';
import type { InventoryCategory, InventoryItem } from '@/types';
import toast from 'react-hot-toast';

const tabs: { key: InventoryCategory | 'movimientos'; label: string; icon: any }[] = [
  { key: 'insumos', label: 'Insumos', icon: Package },
  { key: 'productos', label: 'Productos', icon: ShoppingBag },
  { key: 'materiales', label: 'Materiales (Artel)', icon: Palette },
  { key: 'movimientos', label: 'Historial', icon: Clock },
];

export function InventoryTable() {
  const [activeTab, setActiveTab] = useState<InventoryCategory | 'movimientos'>('consumo');
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<InventoryItem | 'new' | null>(null);
  
  const { data: inventoryData, isLoading } = useInventory();
  const items = inventoryData?.items || [];
  const { data: movementsInfo, isLoading: isLoadingMovs } = useInventoryMovements(1, 40);
  
  const createItem = useCreateInventoryItem();
  const adjustItem = useAdjustInventoryItem();

  const filtered = items
    .filter((i) => i.category === activeTab)
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase())) || [];

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    if (panel === 'new') {
      const data = {
        name: fd.get('name') as string,
        category: (fd.get('category') as InventoryCategory) || 'consumo',
        subcategory: fd.get('subcategory') as string,
        stock: Number(fd.get('stock')),
        unit: 'ud',
        minStock: Number(fd.get('minStock')),
      };
      createItem.mutate(data, { 
        onSuccess: () => { toast.success('Producto creado'); setPanel(null); },
        onError: () => { toast.error('Error creando producto'); }
      });
    } else if (panel && typeof panel === 'object') {
      const adjustmentQty = Number(fd.get('adjustmentQty'));
      const reason = fd.get('reason') as string;
      const notes = fd.get('notes') as string;
      
      adjustItem.mutate({ 
        productId: Number(panel.id), 
        quantity: adjustmentQty, 
        reason, 
        notes 
      }, { 
        onSuccess: () => { toast.success('Inventario ajustado correctamente'); setPanel(null); },
        onError: (err: any) => { toast.error(err.response?.data?.detail || 'Error ajustando stock (Verifique monto positivo/negativo)'); }
      });
    }
  }

  return (
    <div className="relative">
      <div className="mb-4">
        <p className="text-sm text-text-secondary">
          Control de existencias y stock. Los productos listados aquí se definen en el <strong>Catálogo de Productos</strong>.
        </p>
      </div>
      {/* Summary Cards */}
      {!isLoading && activeTab !== 'movimientos' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="glass p-4 !rounded-2xl border-l-4 border-sky">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Productos</p>
            <p className="text-2xl font-display font-bold text-text-primary">{items.length}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-blush">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Stock Bajo / Agotado</p>
            <p className="text-2xl font-display font-bold text-text-primary">{inventoryData?.low_stock_count ?? 0}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-sage">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Última Actividad</p>
            <p className="text-sm font-medium text-text-primary truncate">
              {movementsInfo?.items?.[0]?.product_name ?? 'Sin movimientos'}
            </p>
            <p className="text-[10px] text-text-secondary">Hace un momento</p>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex gap-2">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === key
                  ? 'bg-white/60 text-text-primary shadow-sm'
                  : 'text-text-secondary hover:bg-white/30'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
        {activeTab !== 'movimientos' && (
          <>
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
            </div>
            <Button size="sm" onClick={() => setPanel('new')} icon={<Plus size={14} />}>
              Agregar
            </Button>
          </>
        )}
      </div>

      {activeTab === 'movimientos' ? (
        <div className="glass rounded-xl overflow-hidden p-0">
          {isLoadingMovs ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 border-b border-white/20">
                <tr>
                  <th className="p-4 font-bold text-text-primary">Fecha</th>
                  <th className="p-4 font-bold text-text-primary">Producto</th>
                  <th className="p-4 font-bold text-text-primary">Usuario</th>
                  <th className="p-4 font-bold text-text-primary">Tipo</th>
                  <th className="p-4 font-bold text-text-primary">Cantidad</th>
                  <th className="p-4 font-bold text-text-primary">Razón</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {movementsInfo?.items?.map((m: any) => (
                  <tr key={m.movement_id} className="hover:bg-white/20 transition-colors">
                    <td className="p-4 text-text-secondary">{new Date(m.movement_date).toLocaleString()}</td>
                    <td className="p-4 font-medium text-text-primary">{m.product_name}</td>
                    <td className="p-4 text-text-secondary">{m.user_name}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.movement_type === 'IN' ? 'bg-sage/40 text-green-700' : 'bg-red-100/50 text-red-600'}`}>
                        {m.movement_type}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{m.quantity}</td>
                    <td className="p-4 text-xs text-text-secondary">{m.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        isLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <InventoryRow key={item.id} item={item} onEdit={(i) => setPanel(i)} />
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-text-secondary py-8">No se encontraron productos</p>
            )}
          </div>
        )
      )}

      {panel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-text-primary">
              {panel === 'new' ? 'Nuevo Producto' : 'Ajustar Inventario'}
            </h2>
            <button onClick={() => setPanel(null)} className="p-1 rounded-lg hover:bg-white/40" aria-label="Cerrar">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            {panel === 'new' ? (
              <>
                <FormField label="Nombre" fieldId="name" name="name" required />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Categoría</label>
                  <select name="category" className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50">
                    <option value="insumos">Insumos</option>
                    <option value="productos">Productos</option>
                    <option value="materiales">Materiales (Artel)</option>
                    <option value="consumo">Consumo (Legacy)</option>
                    <option value="creativo">Creativo (Legacy)</option>
                  </select>
                </div>
                <FormField label="Subcategoría (o Descripción)" fieldId="subcategory" name="subcategory" required />
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Stock Inicial" fieldId="stock" name="stock" type="number" required defaultValue="0" />
                  <FormField label="Stock mínimo" fieldId="minStock" name="minStock" type="number" required defaultValue="5" />
                </div>
              </>
            ) : (
              <>
                <div className="bg-white/40 p-4 rounded-xl mb-4">
                  <p className="text-sm text-text-secondary">Producto</p>
                  <p className="font-bold text-text-primary">{panel.name}</p>
                  <p className="text-sm mt-2">Stock actual: <strong>{panel.stock}</strong></p>
                </div>
                <FormField label="Diferencia de Stock (Ej: 5 o -2)" fieldId="adjustmentQty" name="adjustmentQty" type="number" required />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">Razón del Ajuste</label>
                  <select name="reason" className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50">
                    <option value="RECEIPT">Ingreso de Compra (RECEIPT)</option>
                    <option value="RETURN">Devolución (RETURN)</option>
                    <option value="LOSS">Pérdida/Mermas (LOSS)</option>
                    <option value="CORRECTION">Corrección Manual (CORRECTION)</option>
                  </select>
                </div>
                <FormField label="Notas (opcional)" fieldId="notes" name="notes" />
              </>
            )}
            <Button type="submit" className="w-full" loading={createItem.isPending || adjustItem.isPending}>
              Guardar
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
