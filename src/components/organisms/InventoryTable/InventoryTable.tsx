import { useState } from 'react';
import { Package, Palette, Plus, X } from 'lucide-react';
import { InventoryRow } from '@/components/molecules/InventoryRow/InventoryRow';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem } from '@/hooks/useInventory';
import type { InventoryCategory, InventoryItem } from '@/types';

const tabs: { key: InventoryCategory; label: string; icon: typeof Package }[] = [
  { key: 'consumo', label: 'Consumo', icon: Package },
  { key: 'creativo', label: 'Creativo', icon: Palette },
];

export function InventoryTable() {
  const [activeTab, setActiveTab] = useState<InventoryCategory>('consumo');
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<InventoryItem | 'new' | null>(null);
  const { data: items, isLoading } = useInventory();
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();

  const filtered = items
    ?.filter((i) => i.category === activeTab)
    .filter((i) => i.name.toLowerCase().includes(search.toLowerCase())) || [];

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      category: activeTab,
      subcategory: fd.get('subcategory') as string,
      stock: Number(fd.get('stock')),
      unit: fd.get('unit') as string,
      minStock: Number(fd.get('minStock')),
    };

    if (panel === 'new') {
      createItem.mutate(data, { onSuccess: () => setPanel(null) });
    } else if (panel && typeof panel === 'object') {
      updateItem.mutate({ id: panel.id, data }, { onSuccess: () => setPanel(null) });
    }
  }

  return (
    <div className="relative">
      {/* Tabs + controls */}
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
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
        </div>
        <Button size="sm" onClick={() => setPanel('new')} icon={<Plus size={14} />}>
          Agregar
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
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
      )}

      {/* Slide-in panel */}
      {panel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-text-primary">
              {panel === 'new' ? 'Nuevo Producto' : 'Editar Producto'}
            </h2>
            <button onClick={() => setPanel(null)} className="p-1 rounded-lg hover:bg-white/40" aria-label="Cerrar">
              <X size={20} className="text-text-secondary" />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Nombre" fieldId="name" name="name" required defaultValue={panel !== 'new' ? panel.name : ''} />
            <FormField label="Subcategoría" fieldId="subcategory" name="subcategory" required defaultValue={panel !== 'new' ? panel.subcategory : ''} />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Stock" fieldId="stock" name="stock" type="number" required defaultValue={panel !== 'new' ? String(panel.stock) : ''} />
              <FormField label="Unidad" fieldId="unit" name="unit" required defaultValue={panel !== 'new' ? panel.unit : ''} />
            </div>
            <FormField label="Stock mínimo" fieldId="minStock" name="minStock" type="number" required defaultValue={panel !== 'new' ? String(panel.minStock) : ''} />
            <Button type="submit" className="w-full" loading={createItem.isPending || updateItem.isPending}>
              Guardar
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
