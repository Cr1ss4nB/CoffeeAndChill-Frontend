import { useState } from 'react';
import { Plus, X, Pencil, AlertTriangle } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import {
  useIngredients,
  useCreateIngredient,
  useUpdateIngredient,
  useAdjustIngredientStock,
} from '@/hooks/useIngredients';
import type { Ingredient } from '@/services/ingredients.service';
import toast from 'react-hot-toast';

type PanelMode =
  | { type: 'new' }
  | { type: 'adjust'; ingredient: Ingredient }
  | { type: 'edit'; ingredient: Ingredient }
  | null;

const UNITS = ['g', 'kg', 'ml', 'l', 'units'];
const ADJUST_REASONS = [
  { value: 'RECEIPT', label: 'Ingreso / Compra' },
  { value: 'RETURN', label: 'Devolución' },
  { value: 'LOSS', label: 'Pérdida / Merma' },
  { value: 'WASTE', label: 'Desperdicio' },
  { value: 'ADJUSTMENT', label: 'Corrección manual' },
];

export default function IngredientsPage() {
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState<PanelMode>(null);

  const { data: ingredients, isLoading } = useIngredients();
  const createMut = useCreateIngredient();
  const updateMut = useUpdateIngredient();
  const adjustMut = useAdjustIngredientStock();

  const filtered = (ingredients ?? []).filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    if (panel?.type === 'new') {
      createMut.mutate(
        {
          name: fd.get('name') as string,
          unit: fd.get('unit') as string,
          description: (fd.get('description') as string) || undefined,
          min_stock: Number(fd.get('min_stock')),
        },
        {
          onSuccess: () => { toast.success('Insumo creado'); setPanel(null); },
          onError: (err: any) => toast.error(err.response?.data?.detail || 'Error creando insumo'),
        }
      );
    } else if (panel?.type === 'edit') {
      updateMut.mutate(
        {
          id: panel.ingredient.ingredient_id,
          data: {
            name: fd.get('name') as string,
            unit: fd.get('unit') as string,
            description: (fd.get('description') as string) || undefined,
            min_stock: Number(fd.get('min_stock')),
          },
        },
        {
          onSuccess: () => { toast.success('Insumo actualizado'); setPanel(null); },
          onError: (err: any) => toast.error(err.response?.data?.detail || 'Error actualizando insumo'),
        }
      );
    } else if (panel?.type === 'adjust') {
      const qty = Number(fd.get('quantity'));
      adjustMut.mutate(
        {
          ingredientId: panel.ingredient.ingredient_id,
          quantity: qty,
          reason: fd.get('reason') as string,
          notes: (fd.get('notes') as string) || undefined,
        },
        {
          onSuccess: (res) => {
            toast.success(`Stock actualizado: ${res.new_stock} ${res.unit}`);
            setPanel(null);
          },
          onError: (err: any) => toast.error(err.response?.data?.detail || 'Error ajustando stock'),
        }
      );
    }
  }

  const isPending = createMut.isPending || updateMut.isPending || adjustMut.isPending;

  return (
    <DashboardTemplate title="Insumos">
      <p className="text-sm text-text-secondary mb-4 max-w-2xl">
        Gestión de materias primas. El stock se descuenta automáticamente al procesar pedidos
        según el consumo configurado en cada producto.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar insumo..." />
        </div>
        <Button onClick={() => setPanel({ type: 'new' })} icon={<Plus size={16} />}>
          Nuevo insumo
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass rounded-xl overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 border-b border-white/20">
              <tr>
                <th className="p-3 font-bold text-text-primary">Insumo</th>
                <th className="p-3 font-bold text-text-primary">Stock actual</th>
                <th className="p-3 font-bold text-text-primary">Stock mínimo</th>
                <th className="p-3 font-bold text-text-primary">Estado</th>
                <th className="p-3 font-bold text-text-primary text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((ing) => (
                <tr
                  key={ing.ingredient_id}
                  className={`hover:bg-white/20 transition-colors ${!ing.is_active ? 'opacity-50' : ''}`}
                >
                  <td className="p-3">
                    <p className="font-medium text-text-primary">{ing.name}</p>
                    <p className="text-xs text-text-secondary">{ing.unit}</p>
                  </td>
                  <td className="p-3 font-bold text-text-primary">
                    {ing.current_stock} {ing.unit}
                  </td>
                  <td className="p-3 text-text-secondary">
                    {ing.min_stock} {ing.unit}
                  </td>
                  <td className="p-3">
                    {ing.is_low_stock ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-100/50 text-red-600 w-fit">
                        <AlertTriangle size={10} />
                        Bajo
                      </span>
                    ) : ing.current_stock === 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-200/60 text-red-700 w-fit">
                        Agotado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-sage/40 text-green-700 w-fit">
                        OK
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setPanel({ type: 'edit', ingredient: ing })}
                        className="p-2 rounded-lg hover:bg-white/40 text-text-secondary"
                        aria-label="Editar"
                      >
                        <Pencil size={16} />
                      </button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPanel({ type: 'adjust', ingredient: ing })}
                      >
                        Ajustar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No se encontraron insumos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Side panel */}
      {panel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-text-primary">
              {panel.type === 'new' && 'Nuevo insumo'}
              {panel.type === 'edit' && 'Editar insumo'}
              {panel.type === 'adjust' && 'Ajustar stock'}
            </h2>
            <button
              onClick={() => setPanel(null)}
              className="p-1 rounded-lg hover:bg-white/40"
              aria-label="Cerrar"
            >
              <X size={20} className="text-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {(panel.type === 'new' || panel.type === 'edit') && (
              <>
                <FormField
                  label="Nombre"
                  fieldId="name"
                  name="name"
                  required
                  defaultValue={panel.type === 'edit' ? panel.ingredient.name : ''}
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Unidad
                  </label>
                  <select
                    name="unit"
                    required
                    defaultValue={panel.type === 'edit' ? panel.ingredient.unit : 'g'}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <FormField
                  label="Descripción (opcional)"
                  fieldId="description"
                  name="description"
                  defaultValue={panel.type === 'edit' ? (panel.ingredient.description ?? '') : ''}
                />
                <FormField
                  label="Stock mínimo"
                  fieldId="min_stock"
                  name="min_stock"
                  type="number"
                  required
                  defaultValue={panel.type === 'edit' ? String(panel.ingredient.min_stock) : '0'}
                />
              </>
            )}

            {panel.type === 'adjust' && (
              <>
                <div className="bg-white/40 p-4 rounded-xl">
                  <p className="text-sm text-text-secondary">Insumo</p>
                  <p className="font-bold text-text-primary">{panel.ingredient.name}</p>
                  <p className="text-sm mt-1">
                    Stock actual:{' '}
                    <strong>
                      {panel.ingredient.current_stock} {panel.ingredient.unit}
                    </strong>
                  </p>
                </div>
                <FormField
                  label={`Cantidad (${panel.ingredient.unit}) — positivo = entrada, negativo = salida`}
                  fieldId="quantity"
                  name="quantity"
                  type="number"
                  step="0.1"
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Razón
                  </label>
                  <select
                    name="reason"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                  >
                    {ADJUST_REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <FormField
                  label="Notas (opcional)"
                  fieldId="notes"
                  name="notes"
                />
              </>
            )}

            <Button type="submit" className="w-full mt-4" loading={isPending}>
              Guardar
            </Button>
          </form>
        </div>
      )}
    </DashboardTemplate>
  );
}
