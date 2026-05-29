import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X, ToggleLeft, ToggleRight, ExternalLink, FlaskConical } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import api from '@/api/api.client';
import toast from 'react-hot-toast';
import { CategoryManager } from '@/components/organisms/CategoryManager';
import { FolderTree } from 'lucide-react';
import type { Product, Category } from '@/hooks/useCatalog';

type ModalState = Product | 'new' | null;

export default function ProductsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<ModalState>(null);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => (await api.get<Product[]>('/catalog/products')).data,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', showCategoryManager],
    queryFn: async () => {
      const res = await api.get<Category[]>('/catalog/categories');
      return res.data;
    },
  });

  const productCategories = categories?.filter(c => c.type === 'PRODUCT') || [];

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
    mutationFn: ({ id, data }: { id: number; data: FormData | Record<string, unknown> }) => api.patch(`/products/${id}`, data),
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

  const filtered = (products || []).filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const description = (fd.get('description') as string) || '';
    const category_id = Number(fd.get('category_id'));
    const price = Number(fd.get('price'));
    const stock_quantity = Number(fd.get('stock_quantity'));
    const status = fd.get('status') as string;
    const image_url = ((fd.get('image_url') as string) || '').trim() || undefined;

    const payload: Record<string, unknown> = { name, description, category_id, price, stock_quantity, status };
    if (image_url) payload.image_url = image_url;

    if (modal === 'new') createMut.mutate(payload);
    if (modal && typeof modal === 'object') updateMut.mutate({ id: modal.product_id, data: payload });
  }

  return (
    <DashboardTemplate title="Gestión de Productos">
      <div className="mb-6">
        <p className="text-sm text-text-secondary">
          Define aquí los productos del menú. El stock operativo se controla desde <strong>Inventario</strong>.
        </p>
      </div>

      <div className="glass rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-text-primary">Abre la carta pública con estos datos.</p>
        <Link
          to="/menu"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 font-medium text-sm rounded-xl px-3 py-1.5 border border-white/40"
        >
          <ExternalLink size={16} />
          Vista pública
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." />
        </div>
        <div className="w-full lg:w-48">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 border border-white/40 focus:outline-none"
          >
            <option value="all">Todas las categorías</option>
            {productCategories?.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => setShowCategoryManager(true)} variant="ghost" icon={<FolderTree size={16} />}>Gestionar Categorías</Button>
        <Button onClick={() => setModal('new')} icon={<Plus size={16} />}>Nuevo producto</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass rounded-xl overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/40 border-b border-white/20">
              <tr>
                <th className="p-4">#</th><th className="p-4">Nombre</th><th className="p-4">Precio</th>
                <th className="p-4">Stock</th><th className="p-4">Estado</th><th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filtered.map((p) => (
                <tr key={p.product_id} className={p.status === 'INACTIVE' ? 'opacity-50' : ''}>
                  <td className="p-4">#{p.product_id}</td>
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">${p.price}</td>
                  <td className="p-4">{p.stock_quantity}</td>
                  <td className="p-4">{p.status}</td>
                  <td className="p-4 flex gap-2 justify-end">
                    <button onClick={() => toast('Configura insumos en Ingredientes')} className="p-2 rounded-lg hover:bg-white/40"><FlaskConical size={18} /></button>
                    <button onClick={() => setModal(p)} className="p-2 rounded-lg hover:bg-white/40"><Pencil size={18} /></button>
                    <button
                      onClick={() => statusMut.mutate({ id: p.product_id, status: p.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                      className="p-2 rounded-lg hover:bg-white/40"
                    >
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
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg">{modal === 'new' ? 'Nuevo producto' : 'Editar producto'}</h2>
            <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-white/40"><X size={20} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Nombre" fieldId="name" name="name" required defaultValue={modal !== 'new' && modal ? modal.name : ''} />
            <FormField label="Descripción" fieldId="description" name="description" defaultValue={modal !== 'new' && modal ? modal.description : ''} />
            <FormField label="Precio" fieldId="price" name="price" type="number" required defaultValue={modal !== 'new' && modal ? String(modal.price) : ''} />
            <FormField label="Stock base" fieldId="stock_quantity" name="stock_quantity" type="number" required defaultValue={modal !== 'new' && modal ? String(modal.stock_quantity) : '0'} />
            <FormField label="URL imagen" fieldId="image_url" name="image_url" defaultValue={modal !== 'new' && modal ? (modal.image_url || '') : ''} />
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Categoría</label>
              <select name="category_id" required defaultValue={modal !== 'new' && modal ? modal.category_id : ''} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 border border-white/40">
                <option value="">Seleccione...</option>
                {productCategories?.map((c) => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Estado</label>
              <select name="status" defaultValue={modal !== 'new' && modal ? modal.status : 'ACTIVE'} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 border border-white/40">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>
            <Button type="submit" className="w-full" loading={createMut.isPending || updateMut.isPending}>Guardar producto</Button>
          </form>
        </div>
      )}
      {showCategoryManager && <CategoryManager onClose={() => setShowCategoryManager(false)} />}
    </DashboardTemplate>
  );
}
