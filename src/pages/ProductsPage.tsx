import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X, ToggleLeft, ToggleRight, ExternalLink, FlaskConical, Trash2 } from 'lucide-react';
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
      onSuccess: () => toast.success('Consumo actualizado'),
      onError: (err: any) => toast.error(err.response?.data?.detail || 'Error guardando consumo'),
    });
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-display font-bold text-lg text-text-primary">Insumos que consume</h2>
          <p className="text-xs text-text-secondary">{product.name}</p>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/40" aria-label="Cerrar">
          <X size={20} className="text-text-secondary" />
        </button>
      </div>

      <p className="text-xs text-text-secondary mb-4">
        Define cuánto de cada insumo se consume al vender 1 unidad de este producto.
        Dejar vacío = solo controla stock del producto, sin deducción de insumos.
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
                    Cantidad ({ing?.unit ?? ''})
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
                  className="p-2 mb-0.5 rounded-lg hover:bg-red-100/50 text-red-400"
                  aria-label="Eliminar fila"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}

          {rows.length === 0 && (
            <p className="text-sm text-text-secondary text-center py-4">
              Sin consumo configurado — solo descuenta stock del producto.
            </p>
          )}

          <Button variant="ghost" size="sm" onClick={addRow} icon={<Plus size={14} />} className="w-full">
            Agregar insumo
          </Button>
        </div>
      )}

      <Button className="w-full" onClick={handleSave} loading={upsertMut.isPending}>
        Guardar consumo
      </Button>
    </div>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [consumptionProduct, setConsumptionProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/catalog/products');
      return response.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/catalog/categories');
      return response.data;
    },
  });

  const createMut = useMutation({
    mutationFn: (data: FormData | Record<string, unknown>) => api.post('/products', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto creado');
      setModal(null);
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err.response?.data?.detail || 'Error creando producto'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | Record<string, unknown> }) =>
      api.patch(`/products/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-products'] });
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Producto actualizado');
      setModal(null);
    },
    onError: (err: { response?: { data?: { detail?: string } } }) =>
      toast.error(err.response?.data?.detail || 'Error actualizando producto'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/products/${id}/status`, { status }),
    onSuccess: () => { 
      qc.invalidateQueries({ queryKey: ['admin-products'] }); 
      qc.invalidateQueries({ queryKey: ['products'] }); 
      toast.success('Estado actualizado'); 
    },
  });

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const fileField = form.elements.namedItem('image') as HTMLInputElement | null;
    const file = fileField?.files?.[0];
    const hasFile = file && file.size > 0;

    const name = fd.get('name') as string;
    const description = (fd.get('description') as string) || '';
    const categoryId = Number(fd.get('category_id'));
    const price = Number(fd.get('price'));
    const stock = Number(fd.get('stock_quantity'));
    const status = fd.get('status') as string;
    const imageUrl = (fd.get('image_url') as string | null)?.trim() || undefined;

    if (hasFile) {
      const m = new FormData();
      m.append('name', name);
      m.append('description', description);
      m.append('category_id', String(categoryId));
      m.append('price', String(price));
      m.append('stock_quantity', String(stock));
      m.append('status', status);
      m.append('image', file);
      if (imageUrl) m.append('image_url', imageUrl);

      if (modal === 'new') {
        createMut.mutate(m);
      } else if (modal && typeof modal === 'object') {
        updateMut.mutate({ id: modal.product_id, data: m });
      }
    } else {
      const data: Record<string, unknown> = {
        name,
        description,
        category_id: categoryId,
        price,
        stock_quantity: stock,
        status,
      };
      if (imageUrl) {
        data.image_url = imageUrl;
      }

      if (modal === 'new') {
        createMut.mutate(data);
      } else if (modal && typeof modal === 'object') {
        updateMut.mutate({ id: modal.product_id, data });
      }
    }
  }

  const filtered = (products || []).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardTemplate title="Gestión de Productos">
      <div className="mb-6">
        <p className="text-sm text-text-secondary">
          Define aquí los productos de tu menú (nombre, precio, categoría base). 
          Para controlar el stock y ver movimientos, ve a la sección de <strong>Inventario</strong>.
        </p>
      </div>

      <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-text-primary">
          ¿Cómo se ve hoy? Abre la carta con los mismos datos que en sala.
        </p>
        <Link
          to="/menu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-medium text-sm rounded-xl px-3 py-1.5 border border-white/40 bg-transparent backdrop-blur-sm text-text-primary hover:bg-white/20 transition-colors w-fit"
        >
          <ExternalLink size={16} />
          Vista pública
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar en la carta…" />
        </div>
        <div className="w-full lg:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
          >
            <option value="all">Todas las categorías</option>
            {categories?.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setModal('new')} icon={<Plus size={16} />}>
          Nuevo producto
        </Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass rounded-xl overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 border-b border-white/20">
              <tr>
                <th className="p-4 font-bold text-text-primary w-12">#</th>
                <th className="p-4 font-bold text-text-primary w-14">Imagen</th>
                <th className="p-4 font-bold text-text-primary">Nombre</th>
                <th className="p-4 font-bold text-text-primary">Precio</th>
                <th className="p-4 font-bold text-text-primary">Stock</th>
                <th className="p-4 font-bold text-text-primary">Estado</th>
                <th className="p-4 font-bold text-text-primary text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((p) => (
                <tr key={p.product_id} className={`hover:bg-white/20 transition-colors ${p.status === 'INACTIVE' ? 'opacity-50' : ''}`}>
                  <td className="p-4 text-text-secondary align-middle">#{p.product_id}</td>
                  <td className="p-4 align-middle">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/40 border border-white/20">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-secondary/50 text-xs">
                          {p.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-text-primary align-middle">{p.name}</td>
                  <td className="p-4 text-text-secondary align-middle">${p.price}</td>
                  <td className="p-4 text-text-secondary align-middle">{p.stock_quantity}</td>
                  <td className="p-4 align-middle">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.status === 'ACTIVE' ? 'bg-sage/40 text-green-700' : 'bg-red-100/50 text-red-600'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2 justify-end align-middle">
                      <button
                        onClick={() => setConsumptionProduct(p)}
                        className="p-2 rounded-lg hover:bg-white/40 text-text-secondary"
                        aria-label="Configurar insumos"
                        title="Insumos que consume"
                      >
                        <FlaskConical size={18} />
                      </button>
                    <button onClick={() => setModal(p)} className="p-2 rounded-lg hover:bg-white/40 text-text-secondary" aria-label="Editar">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => {
                        const newStatus = p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                        if(confirm(`¿Marcar este producto como ${newStatus}?`)) {
                            statusMut.mutate({ id: p.product_id, status: newStatus });
                        }
                    }} className="p-2 rounded-lg hover:bg-white/40 text-text-secondary" aria-label="Cambiar estado">
                      {p.status === 'ACTIVE' ? <ToggleRight size={18} className="text-green-500" /> : <ToggleLeft size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl shadow-black/20 animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-text-primary">
              {modal === 'new' ? 'Nuevo producto' : 'Editar producto'}
            </h2>
            <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-white/40" type="button" aria-label="Cerrar">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField
              label="Nombre comercial"
              fieldId="name"
              name="name"
              required
              defaultValue={modal !== 'new' && typeof modal === 'object' ? modal.name : ''}
            />
            <FormField
              label="Descripción"
              fieldId="description"
              name="description"
              defaultValue={modal !== 'new' && typeof modal === 'object' ? modal.description : ''}
            />
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Categoría</label>
              <select
                name="category_id"
                required
                defaultValue={modal !== 'new' && typeof modal === 'object' ? modal.category_id : ''}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
              >
                <option value="">Seleccione...</option>
                {categories?.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-4 pt-2">
              <FormField
                label="URL de imagen (opcional)"
                fieldId="image_url"
                name="image_url"
                type="url"
                placeholder="https://…"
                defaultValue={modal !== 'new' && typeof modal === 'object' ? (modal.image_url ?? '') : ''}
              />
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-text-primary mb-1">
                  O subir archivo
                </label>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="block w-full text-xs text-text-secondary file:mr-3 file:rounded-lg file:border-0 file:bg-blush/30 file:px-3 file:py-1.5 file:font-medium file:text-text-primary"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField
                label="Precio"
                fieldId="price"
                name="price"
                type="number"
                required
                defaultValue={modal !== 'new' && typeof modal === 'object' ? String(modal.price) : ''}
              />
              <FormField
                label="Stock base"
                fieldId="stock_quantity"
                name="stock_quantity"
                type="number"
                required
                defaultValue={modal !== 'new' && typeof modal === 'object' ? String(modal.stock_quantity) : '0'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Estado en carta</label>
              <select
                name="status"
                defaultValue={modal !== 'new' && typeof modal === 'object' ? modal.status : 'ACTIVE'}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
              >
                <option value="ACTIVE">Activo (visible)</option>
                <option value="INACTIVE">Inactivo (oculto)</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-4" loading={createMut.isPending || updateMut.isPending}>
              Guardar producto
            </Button>
          </form>
        </div>
      )}

      {consumptionProduct && (
        <ConsumptionPanel
          product={consumptionProduct}
          onClose={() => setConsumptionProduct(null)}
        />
      )}
    </DashboardTemplate>
  );
}
