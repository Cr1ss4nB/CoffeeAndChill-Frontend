import { useState } from 'react';
import { Plus, Pencil, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { Select } from '@/components/atoms/Select/Select';
import { FormField } from '@/components/molecules/FormField/FormField';
import { ConfirmStatusDialog } from '@/components/molecules/ConfirmStatusDialog/ConfirmStatusDialog';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
  type Category,
} from '@/hooks/useCatalog';

type ActiveTab = 'all' | 'disabled';
type PanelMode = Category | 'new' | null;
type PendingStatus = { category: Category; newActive: boolean } | null;

export default function CategoriesPage() {
  const [panel, setPanel] = useState<PanelMode>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [pendingStatus, setPendingStatus] = useState<PendingStatus>(null);

  const { data: categories, isLoading } = useAdminCategories();
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();
  const toggleMut = useToggleCategoryStatus();

  const allCategories = categories || [];
  const activeCategories = allCategories.filter((c) => c.is_active);
  const inactiveCategories = allCategories.filter((c) => !c.is_active);
  const productCategories = activeCategories.filter((c) => c.type === 'PRODUCT');
  const workshopCategories = activeCategories.filter((c) => c.type === 'WORKSHOP');

  const filtered =
    activeTab === 'disabled'
      ? inactiveCategories.filter((c) =>
          c.category_name.toLowerCase().includes(search.toLowerCase())
        )
      : allCategories
          .filter((c) => c.is_active)
          .filter((c) =>
            c.category_name.toLowerCase().includes(search.toLowerCase())
          );

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const category_name = fd.get('category_name') as string;
    const type = fd.get('type') as 'PRODUCT' | 'WORKSHOP';
    const description = (fd.get('description') as string) || '';
    const is_active = fd.get('is_active') === 'true';

    const payload = { category_name, type, description, is_active };

    if (panel === 'new') {
      createMut.mutate(payload, {
        onSuccess: () => {
          setPanel(null);
          e.currentTarget.reset();
        },
      });
    } else if (panel && typeof panel === 'object') {
      updateMut.mutate(
        { id: panel.category_id, data: payload },
        {
          onSuccess: () => setPanel(null),
        }
      );
    }
  }

  function handleToggleClick(category: Category) {
    setPendingStatus({ category, newActive: !category.is_active });
  }

  const editCategory = panel !== 'new' ? panel : null;

  return (
    <DashboardTemplate title="Gestión de Categorías">
      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass p-4 !rounded-2xl border-l-4 border-sky">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Activas</p>
            <p className="text-2xl font-display font-bold text-text-primary">{activeCategories.length}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-sage">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Productos</p>
            <p className="text-2xl font-display font-bold text-text-primary">{productCategories.length}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-purple">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Talleres</p>
            <p className="text-2xl font-display font-bold text-text-primary">{workshopCategories.length}</p>
          </div>
          <div
            className="glass p-4 !rounded-2xl border-l-4 border-red-300 cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => setActiveTab('disabled')}
            role="button"
            title="Ver deshabilitados"
          >
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Deshabilitadas</p>
            <p className="text-2xl font-display font-bold text-red-500">{inactiveCategories.length}</p>
          </div>
        </div>
      )}

      {/* Tabs de categorías + Deshabilitados */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <Button
          variant="ghost" size="sm"
          onClick={() => setActiveTab('all')}
          className={`shrink-0 ${activeTab === 'all' ? 'bg-white/60 shadow-sm' : 'border-transparent text-text-secondary hover:bg-white/30'}`}
        >
          Todos
        </Button>
        <div className="w-px h-5 bg-white/30 shrink-0 mx-1" />
        <Button
          variant="ghost" size="sm"
          onClick={() => setActiveTab('disabled')}
          icon={<ToggleLeft size={14} />}
          className={`shrink-0 ${activeTab === 'disabled' ? 'bg-red-100/60 text-red-700 border-red-200/40 shadow-sm' : 'border-transparent text-text-secondary hover:bg-white/30'}`}
        >
          Deshabilitados
          {inactiveCategories.length > 0 && (
            <span className="ml-0.5 bg-red-200/70 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {inactiveCategories.length}
            </span>
          )}
        </Button>
      </div>

      {/* Search + New */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar categoría…" />
        </div>
        <Button onClick={() => setPanel('new')} icon={<Plus size={16} />}>
          Nueva categoría
        </Button>
      </div>

      {/* Categories table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={`glass rounded-xl overflow-hidden p-0 ${activeTab === 'disabled' ? 'opacity-90' : ''}`}>
          {activeTab === 'disabled' && (
            <div className="px-4 py-2.5 bg-red-50/40 border-b border-red-100/40 flex items-center gap-2">
              <ToggleLeft size={14} className="text-red-500" />
              <p className="text-xs text-red-600 font-medium">
                Categorías deshabilitadas — no aparecen en el menú público.
              </p>
            </div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 border-b border-white/20">
              <tr>
                <th className="p-4 font-bold text-text-primary w-12">#</th>
                <th className="p-4 font-bold text-text-primary">Nombre</th>
                <th className="p-4 font-bold text-text-primary">Tipo</th>
                <th className="p-4 font-bold text-text-primary">Descripción</th>
                <th className="p-4 font-bold text-text-primary">Estado</th>
                <th className="p-4 font-bold text-text-primary text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((c) => (
                <tr key={c.category_id} className="hover:bg-white/20 transition-colors">
                  <td className="p-4 text-text-secondary align-middle">#{c.category_id}</td>
                  <td className="p-4 align-middle">
                    <p className="font-medium text-text-primary">{c.category_name}</p>
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-[10px] font-bold ${
                        c.type === 'PRODUCT'
                          ? 'bg-blue-100/60 text-blue-700'
                          : 'bg-purple-100/60 text-purple-700'
                      }`}
                    >
                      {c.type === 'PRODUCT' ? 'Producto' : 'Taller'}
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary text-xs max-w-[200px] truncate align-middle">
                    {c.description || '—'}
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        c.is_active
                          ? 'bg-sage/40 text-green-700'
                          : 'bg-red-100/50 text-red-600'
                      }`}
                    >
                      {c.is_active ? 'Activa' : 'Inactiva'}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => setPanel(c)} aria-label="Editar" title="Editar categoría" icon={<Pencil size={18} />} />
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleToggleClick(c)}
                        aria-label="Cambiar estado"
                        title={c.is_active ? 'Desactivar' : 'Activar'}
                        icon={c.is_active ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-secondary">
                    {activeTab === 'disabled'
                      ? 'No hay categorías deshabilitadas'
                      : 'No se encontraron categorías'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel crear / editar */}
      {panel && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg">
              {panel === 'new' ? 'Nueva categoría' : 'Editar categoría'}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setPanel(null)} aria-label="Cerrar" icon={<X size={20} />} />
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Nombre"
              fieldId="category_name"
              name="category_name"
              required
              defaultValue={editCategory?.category_name ?? ''}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Tipo
              </label>
              <Select
                name="type"
                required
                defaultValue={editCategory?.type ?? 'PRODUCT'}
                disabled={editCategory !== null}
              >
                <option value="PRODUCT">Producto</option>
                <option value="WORKSHOP">Taller / Evento</option>
              </Select>
              {editCategory !== null && (
                <p className="text-xs text-text-secondary mt-1">
                  El tipo no se puede cambiar después de crear.
                </p>
              )}
            </div>

            <FormField
              label="Descripción"
              fieldId="description"
              name="description"
              defaultValue={editCategory?.description ?? ''}
            />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">
                Estado
              </label>
              <Select
                name="is_active"
                defaultValue={editCategory ? (editCategory.is_active ? 'true' : 'false') : 'true'}
              >
                <option value="true">Activa</option>
                <option value="false">Inactiva</option>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={createMut.isPending || updateMut.isPending}
            >
              {panel === 'new' ? 'Crear categoría' : 'Guardar cambios'}
            </Button>
          </form>
        </div>
      )}

      {/* Confirmar cambio de estado */}
      <ConfirmStatusDialog
        open={pendingStatus !== null}
        itemName={pendingStatus?.category.category_name ?? ''}
        itemLabel="categoría"
        activating={pendingStatus?.newActive ?? false}
        loading={toggleMut.isPending}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => {
          if (!pendingStatus) return;
          toggleMut.mutate(
            { id: pendingStatus.category.category_id, is_active: pendingStatus.newActive },
            { onSettled: () => setPendingStatus(null) }
          );
        }}
      />
    </DashboardTemplate>
  );
}