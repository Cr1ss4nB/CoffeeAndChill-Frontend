import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X, ToggleLeft, ToggleRight, FlaskConical, Trash2 } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import api from '@/api/api.client';
import toast from 'react-hot-toast';
import type { Product, Category } from '@/hooks/useCatalog';
import { useIngredients, useProductConsumption, useUpsertProductConsumption } from '@/hooks/useIngredients';

type ModalState = Product | 'new' | null;
type ConsumptionRow = { ingredient_id: number; quantity_used: number };
type PendingStatus = { product: Product; newStatus: 'ACTIVE' | 'INACTIVE' } | null;

function ConfirmStatusDialog({
  pending,
  onConfirm,
  onCancel,
  loading,
}: {
  pending: PendingStatus;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!pending) return null;
  const activating = pending.newStatus === 'ACTIVE';

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-[3px]"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div className="glass rounded-3xl p-6 w-full max-w-sm shadow-2xl pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-4 mb-5">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                activating ? 'bg-sage/30' : 'bg-red-100/60'
              }`}
            >
              {activating ? (
                <ToggleRight size={20} className="text-green-600" />
              ) : (
                <ToggleLeft size={20} className="text-red-500" />
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-text-primary text-base leading-snug">
                {activating ? 'Activar producto' : 'Desactivar producto'}
              </h3>
              <p className="text-sm text-text-secondary mt-1">
                <span className="font-medium text-text-primary">{pending.product.name}</span>{' '}
                {activating
                  ? 'volverá a aparecer en el menú y podrá recibir pedidos.'
                  : 'dejará de estar disponible en el menú y no podrá recibir pedidos.'}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary bg-white/40 hover:bg-white/60 border border-white/30 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-60 ${
                activating
                  ? 'bg-sage/60 hover:bg-sage/80 text-green-800'
                  : 'bg-red-100/60 hover:bg-red-200/70 text-red-700'
              }`}
            >
              {loading ? 'Guardando…' : activating ? 'Activar' : 'Desactivar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Panel de receta para productos existentes (accesible vía botón FlaskConical)
function ConsumptionPanel({ product, onClose }: { product: Product; onClose: () => void }) {
  const { data: ingredients } = useIngredients();
  const { data: consumption, isLoading } = useProductConsumption(product.product_id);
  const upsertMut = useUpsertProductConsumption(product.product_id);

  const [rows, setRows] = useState<ConsumptionRow[]>([]);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && consumption) {
    setRows(consumption.map((c) => ({ ingredient_id: c.ingredient_id, quantity_used: c.quantity_used })));
    setInitialized(true);
  }

  function addRow() {
    const firstUnused = ingredients?.find((i) => !rows.some((r) => r.ingredient_id === i.ingredient_id));
    if (!firstUnused) return;
    setRows((prev) => [...prev, { ingredient_id: firstUnused.ingredient_id, quantity_used: 1 }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof ConsumptionRow, value: number) {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)));
  }

  function handleSave() {
    upsertMut.mutate(rows, {
      onSuccess: () => toast.success('Receta actualizada'),
      onError: (err: any) => toast.error(err.response?.data?.detail || 'Error guardando receta'),
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-display font-bold text-lg text-text-primary">Receta / Insumos</h2>
          <p className="text-xs text-text-secondary">{product.name}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/40" aria-label="Cerrar">
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      <p className="text-xs text-text-secondary mb-4">
        Define cuánto de cada insumo se consume al vender 1 unidad. Sin líneas = solo descuenta stock del producto.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="space-y-3 mb-4">
          {rows.map((row, i) => {
            const ing = ingredients?.find((x) => x.ingredient_id === row.ingredient_id);
            return (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-text-primary mb-1">Insumo</label>
                  <select
                    value={row.ingredient_id}
                    onChange={(e) => updateRow(i, 'ingredient_id', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                  >
                    {ingredients?.map((ing) => (
                      <option key={ing.ingredient_id} value={ing.ingredient_id}>
                        {ing.name} ({ing.unit})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-28">
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Cant. ({ing?.unit ?? ''})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={row.quantity_used}
                    onChange={(e) => updateRow(i, 'quantity_used', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                  />
                </div>
                <button
                  onClick={() => removeRow(i)}
                  type="button"
                  className="p-2 mb-0.5 rounded-lg hover:bg-red-100/50 text-red-400"
                  aria-label="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {rows.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              Sin insumos configurados.
            </p>
          )}

          <Button variant="ghost" size="sm" onClick={addRow} type="button" icon={<Plus size={14} />} className="w-full">
            Agregar insumo
          </Button>
        </div>
      )}

      <Button className="w-full" onClick={handleSave} loading={upsertMut.isPending}>
        Guardar receta
      </Button>
    </div>
  );
}

// Panel de creación / edición de producto con toggle de receta
function ProductPanel({
  modal,
  categories,
  onClose,
}: {
  modal: Exclude<ModalState, null>;
  categories: Category[];
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const isNew = modal === 'new';
  const editProduct = isNew ? null : (modal as Product);

  const [requiresRecipe, setRequiresRecipe] = useState(
    !isNew &&
      (editProduct?.fulfillment_type === 'INGREDIENTS' || editProduct?.fulfillment_type === 'BOTH'),
  );
  const [recipeRows, setRecipeRows] = useState<ConsumptionRow[]>([]);
  const [recipeInit, setRecipeInit] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(editProduct?.image_url ?? '');
  const [saving, setSaving] = useState(false);

  const { data: ingredients } = useIngredients();
  const productId = editProduct?.product_id ?? 0;
  const { data: existingConsumption } = useProductConsumption(productId);

  if (!recipeInit && existingConsumption && !isNew) {
    setRecipeRows(
      existingConsumption.map((c) => ({ ingredient_id: c.ingredient_id, quantity_used: c.quantity_used })),
    );
    setRecipeInit(true);
  }

  function addRow() {
    const firstUnused = ingredients?.find((i) => !recipeRows.some((r) => r.ingredient_id === i.ingredient_id));
    if (!firstUnused) return;
    setRecipeRows((prev) => [...prev, { ingredient_id: firstUnused.ingredient_id, quantity_used: 1 }]);
  }

  function removeRow(idx: number) {
    setRecipeRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateRow(idx: number, field: keyof ConsumptionRow, val: number) {
    setRecipeRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);

    try {
      // Upload image first if a new file was selected
      let image_url = editProduct?.image_url;
      if (imageFile) {
        const imgFd = new FormData();
        imgFd.append('file', imageFile);
        const res = await api.post<{ image_url: string }>('/products/upload-image', imgFd);
        image_url = res.data.image_url;
      }

      const payload: Record<string, unknown> = {
        name: fd.get('name') as string,
        description: (fd.get('description') as string) || '',
        category_id: Number(fd.get('category_id')),
        price: Number(fd.get('price')),
        stock_quantity: requiresRecipe ? 0 : Number(fd.get('stock_quantity')),
        fulfillment_type: requiresRecipe ? 'INGREDIENTS' : 'STOCK',
        status: (fd.get('status') as string) || 'ACTIVE',
      };
      if (image_url) payload.image_url = image_url;

      let savedProductId: number;
      if (isNew) {
        const res = await api.post<Product>('/products', payload);
        savedProductId = res.data.product_id;
        toast.success('Producto creado');
      } else {
        await api.patch(`/products/${editProduct!.product_id}`, payload);
        savedProductId = editProduct!.product_id;
        toast.success('Producto actualizado');
      }

      if (requiresRecipe && recipeRows.length > 0) {
        await api.post(`/ingredients/products/${savedProductId}/consumption`, { items: recipeRows });
      }

      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Error guardando producto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl shadow-black/20 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-lg text-text-primary">
          {isNew ? 'Nuevo producto' : 'Editar producto'}
        </h2>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/40" type="button" aria-label="Cerrar">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Nombre comercial"
          fieldId="name"
          name="name"
          required
          defaultValue={editProduct?.name ?? ''}
        />

        <FormField
          label="Descripción"
          fieldId="description"
          name="description"
          defaultValue={editProduct?.description ?? ''}
        />

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Categoría</label>
          <select
            name="category_id"
            required
            defaultValue={editProduct?.category_id ?? ''}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
          >
            <option value="">Seleccione...</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* Foto del producto */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Foto del producto</label>
          {imagePreview && (
            <div className="mb-2 w-20 h-20 rounded-xl overflow-hidden border border-white/40 bg-white/30">
              <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-xs text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blush/30 file:px-3 file:py-1.5 file:font-medium file:text-text-primary cursor-pointer"
          />
        </div>

        {/* Toggle receta */}
        <div>
          <p className="text-sm font-medium text-text-primary mb-2">¿Requiere receta?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRequiresRecipe(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                !requiresRecipe
                  ? 'bg-white/60 border-white/60 text-text-primary shadow-sm'
                  : 'bg-white/20 border-white/20 text-text-secondary hover:bg-white/30'
              }`}
            >
              No — Stock manual
            </button>
            <button
              type="button"
              onClick={() => setRequiresRecipe(true)}
              className={`px-4 py-3 rounded-xl text-sm font-medium border transition-all ${
                requiresRecipe
                  ? 'bg-white/60 border-white/60 text-text-primary shadow-sm'
                  : 'bg-white/20 border-white/20 text-text-secondary hover:bg-white/30'
              }`}
            >
              Sí — Por receta
            </button>
          </div>
        </div>

        {/* Precio — siempre visible */}
        <FormField
          label="Precio"
          fieldId="price"
          name="price"
          type="number"
          step="0.01"
          min="0.01"
          required
          defaultValue={editProduct ? String(editProduct.price) : ''}
        />

        {/* Stock manual — solo si no requiere receta */}
        {!requiresRecipe && (
          <FormField
            label="Stock"
            fieldId="stock_quantity"
            name="stock_quantity"
            type="number"
            min="0"
            required
            defaultValue={editProduct ? String(editProduct.stock_quantity) : '0'}
          />
        )}

        {/* Receta inline — solo si requiere receta */}
        {requiresRecipe && (
          <div className="bg-white/30 rounded-xl p-4 space-y-3 border border-white/30">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text-primary">Insumos de la receta</p>
              <p className="text-xs text-text-secondary">Stock calculado automáticamente</p>
            </div>

            {recipeRows.map((row, i) => {
              const ing = ingredients?.find((x) => x.ingredient_id === row.ingredient_id);
              return (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-text-primary mb-1">Insumo</label>
                    <select
                      value={row.ingredient_id}
                      onChange={(e) => updateRow(i, 'ingredient_id', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                    >
                      {ingredients?.map((ingr) => (
                        <option key={ingr.ingredient_id} value={ingr.ingredient_id}>
                          {ingr.name} ({ingr.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-28">
                    <label className="block text-xs font-medium text-text-primary mb-1">
                      Cant. ({ing?.unit ?? ''})
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={row.quantity_used}
                      onChange={(e) => updateRow(i, 'quantity_used', Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl text-sm bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                    />
                  </div>
                  <button
                    onClick={() => removeRow(i)}
                    type="button"
                    className="p-2 mb-0.5 rounded-lg hover:bg-red-100/50 text-red-400"
                    aria-label="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}

            {recipeRows.length === 0 && (
              <p className="text-xs text-text-secondary text-center py-2">
                Sin insumos. El stock quedará en 0 hasta agregar la receta.
              </p>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={addRow}
              type="button"
              icon={<Plus size={14} />}
              className="w-full"
            >
              Agregar insumo
            </Button>
          </div>
        )}

        {/* Estado — solo en edición */}
        {!isNew && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Estado en carta</label>
            <select
              name="status"
              defaultValue={editProduct?.status ?? 'ACTIVE'}
              className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
            >
              <option value="ACTIVE">Activo (visible)</option>
              <option value="INACTIVE">Inactivo (oculto)</option>
            </select>
          </div>
        )}

        <Button type="submit" className="w-full mt-4" loading={saving}>
          Guardar producto
        </Button>
      </form>
    </div>
  );
}

type ActiveTab = 'all' | 'disabled' | number;

export default function InventoryPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [consumptionProduct, setConsumptionProduct] = useState<Product | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PendingStatus>(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');

  // active_only=false → incluye INACTIVE
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/catalog/products?active_only=false');
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/catalog/categories?active_only=false');
      return res.data;
    },
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/products/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Estado actualizado');
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail || 'Error actualizando estado'),
  });

  const allProducts = products ?? [];
  const activeProducts = allProducts.filter((p) => p.status === 'ACTIVE');
  const inactiveProducts = allProducts.filter((p) => p.status === 'INACTIVE');

  // Categorías que tienen al menos 1 producto ACTIVE
  const categoriesWithProducts = (categories ?? []).filter((c) =>
    activeProducts.some((p) => p.category_id === c.category_id),
  );

  const filtered = allProducts.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    if (activeTab === 'disabled') return p.status === 'INACTIVE' && matchSearch;
    if (activeTab === 'all') return p.status === 'ACTIVE' && matchSearch;
    return p.status === 'ACTIVE' && p.category_id === activeTab && matchSearch;
  });

  const lowStockCount = activeProducts.filter((p) => (p.available_to_sell ?? p.stock_quantity) < 5).length;

  return (
    <DashboardTemplate title="Gestión de Almacén">
      {/* Summary cards */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="glass p-4 !rounded-2xl border-l-4 border-sky">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Activos</p>
            <p className="text-2xl font-display font-bold text-text-primary">{activeProducts.length}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-blush">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Stock Bajo</p>
            <p className="text-2xl font-display font-bold text-text-primary">{lowStockCount}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-sage">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Con Receta</p>
            <p className="text-2xl font-display font-bold text-text-primary">
              {activeProducts.filter((p) => p.fulfillment_type === 'INGREDIENTS' || p.fulfillment_type === 'BOTH').length}
            </p>
          </div>
          <div
            className="glass p-4 !rounded-2xl border-l-4 border-red-300 cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => setActiveTab('disabled')}
            role="button"
            title="Ver deshabilitados"
          >
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Deshabilitados</p>
            <p className="text-2xl font-display font-bold text-red-500">{inactiveProducts.length}</p>
          </div>
        </div>
      )}

      {/* Tabs de categorías + Deshabilitados */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveTab('all')}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'all'
              ? 'bg-white/60 text-text-primary shadow-sm'
              : 'text-text-secondary hover:bg-white/30'
          }`}
        >
          Todos
        </button>
        {categoriesWithProducts.map((c) => (
          <button
            key={c.category_id}
            onClick={() => setActiveTab(c.category_id)}
            className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === c.category_id
                ? 'bg-white/60 text-text-primary shadow-sm'
                : 'text-text-secondary hover:bg-white/30'
            }`}
          >
            {c.category_name}
          </button>
        ))}
        <div className="w-px h-5 bg-white/30 shrink-0 mx-1" />
        <button
          onClick={() => setActiveTab('disabled')}
          className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'disabled'
              ? 'bg-red-100/60 text-red-700 shadow-sm'
              : 'text-text-secondary hover:bg-white/30'
          }`}
        >
          <ToggleLeft size={14} />
          Deshabilitados
          {inactiveProducts.length > 0 && (
            <span className="ml-0.5 bg-red-200/70 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {inactiveProducts.length}
            </span>
          )}
        </button>
      </div>

      {/* Search + New */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto…" />
        </div>
        <Button onClick={() => setModal('new')} icon={<Plus size={16} />}>
          Nuevo producto
        </Button>
      </div>

      {/* Product table */}
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
                Productos deshabilitados — no aparecen en el menú ni reciben pedidos.
              </p>
            </div>
          )}
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 border-b border-white/20">
              <tr>
                <th className="p-4 font-bold text-text-primary w-12">#</th>
                <th className="p-4 font-bold text-text-primary w-14">Imagen</th>
                <th className="p-4 font-bold text-text-primary">Nombre</th>
                <th className="p-4 font-bold text-text-primary">Categoría</th>
                <th className="p-4 font-bold text-text-primary">Precio</th>
                <th className="p-4 font-bold text-text-primary">Stock</th>
                <th className="p-4 font-bold text-text-primary">Estado</th>
                <th className="p-4 font-bold text-text-primary text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((p) => {
                const stock = p.available_to_sell ?? p.stock_quantity;
                const isRecipe =
                  p.fulfillment_type === 'INGREDIENTS' || p.fulfillment_type === 'BOTH';
                return (
                  <tr
                    key={p.product_id}
                    className="hover:bg-white/20 transition-colors"
                  >
                    <td className="p-4 text-text-secondary align-middle">#{p.product_id}</td>
                    <td className="p-4 align-middle">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/40 border border-white/20">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-secondary/50 text-xs font-bold">
                            {p.name.charAt(0)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <p className="font-medium text-text-primary">{p.name}</p>
                      {isRecipe && (
                        <span className="text-[10px] text-blush font-semibold">Por receta</span>
                      )}
                    </td>
                    <td className="p-4 text-text-secondary text-xs align-middle">
                      {categories?.find((c) => c.category_id === p.category_id)?.category_name || '—'}
                    </td>
                    <td className="p-4 text-text-secondary align-middle">${p.price}</td>
                    <td className="p-4 align-middle">
                      <span className={`font-medium ${stock < 5 ? 'text-red-500' : 'text-text-secondary'}`}>
                        {stock}
                      </span>
                      {isRecipe && (
                        <span className="block text-[10px] text-text-secondary">de insumos</span>
                      )}
                    </td>
                    <td className="p-4 align-middle">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                          p.status === 'ACTIVE'
                            ? 'bg-sage/40 text-green-700'
                            : 'bg-red-100/50 text-red-600'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-1 justify-end">
                        <button
                          onClick={() => setConsumptionProduct(p)}
                          className="p-2 rounded-lg hover:bg-white/40 text-text-secondary"
                          aria-label="Configurar receta"
                          title="Receta / Insumos"
                        >
                          <FlaskConical size={18} />
                        </button>
                        <button
                          onClick={() => setModal(p)}
                          className="p-2 rounded-lg hover:bg-white/40 text-text-secondary"
                          aria-label="Editar"
                          title="Editar producto"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() =>
                            setPendingStatus({
                              product: p,
                              newStatus: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            })
                          }
                          className="p-2 rounded-lg hover:bg-white/40 text-text-secondary"
                          aria-label="Cambiar estado"
                          title={p.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                        >
                          {p.status === 'ACTIVE' ? (
                            <ToggleRight size={18} className="text-green-500" />
                          ) : (
                            <ToggleLeft size={18} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-text-secondary">
                    {activeTab === 'disabled'
                      ? 'No hay productos deshabilitados'
                      : 'No se encontraron productos'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Panel crear / editar */}
      {modal !== null && (
        <ProductPanel
          modal={modal}
          categories={categories ?? []}
          onClose={() => setModal(null)}
        />
      )}

      {/* Panel receta */}
      {consumptionProduct && (
        <ConsumptionPanel
          product={consumptionProduct}
          onClose={() => setConsumptionProduct(null)}
        />
      )}

      {/* Confirmar cambio de estado */}
      <ConfirmStatusDialog
        pending={pendingStatus}
        loading={statusMut.isPending}
        onCancel={() => setPendingStatus(null)}
        onConfirm={() => {
          if (!pendingStatus) return;
          statusMut.mutate(
            { id: pendingStatus.product.product_id, status: pendingStatus.newStatus },
            { onSettled: () => setPendingStatus(null) },
          );
        }}
      />
    </DashboardTemplate>
  );
}
