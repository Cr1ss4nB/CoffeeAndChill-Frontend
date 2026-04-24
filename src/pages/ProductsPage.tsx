import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import api from '@/api/api.client';
import toast from 'react-hot-toast';
import type { Product, Category } from '@/hooks/useCatalog';

export default function ProductsPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<Product | 'new' | null>(null);
  const [search, setSearch] = useState('');

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
    mutationFn: (data: any) => api.post('/products', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Producto creado'); setModal(null); },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Error creando producto'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/products/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Producto actualizado'); setModal(null); },
    onError: (err: any) => toast.error(err.response?.data?.detail || 'Error actualizando producto'),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.patch(`/products/${id}/status`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-products'] }); qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Estado actualizado'); },
  });

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      category_id: Number(fd.get('category_id')),
      price: Number(fd.get('price')),
      stock_quantity: Number(fd.get('stock_quantity')),
      description: fd.get('description') as string,
      status: fd.get('status') as string,
      image_url: fd.get('image_url') as string,
    };

    if (modal === 'new') {
      createMut.mutate(data);
    } else if (modal && typeof modal === 'object') {
      updateMut.mutate({ id: modal.product_id, data });
    }
  }

  const filtered = products?.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <DashboardTemplate title="Gestión de Productos">
      <div className="mb-6">
        <p className="text-sm text-text-secondary">
          Define aquí los productos de tu menú (nombre, precio, categoría base). 
          Para controlar el stock y ver movimientos, ve a la sección de <strong>Inventario</strong>.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Buscar producto..." /></div>
        <Button onClick={() => setModal('new')} icon={<Plus size={16} />}>Nuevo Producto</Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="glass rounded-xl overflow-hidden p-0">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/40 border-b border-white/20">
                <tr>
                  <th className="p-4 font-bold text-text-primary">Imagen</th>
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
                    <td className="p-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/40 border border-white/20">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-secondary">
                            <Plus size={16} />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-text-primary">{p.name}</td>
                    <td className="p-4 text-text-secondary">${p.price}</td>
                    <td className="p-4 text-text-secondary">{p.stock_quantity}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === 'ACTIVE' ? 'bg-sage/40 text-green-700' : 'bg-red-100/50 text-red-600'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 flex gap-2 justify-end">
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
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-lg text-text-primary">
              {modal === 'new' ? 'Nuevo Producto' : 'Editar Producto'}
            </h2>
            <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-white/40"><X size={20} /></button>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <FormField label="Nombre Comercial" fieldId="name" name="name" required defaultValue={modal !== 'new' ? modal.name : ''} />
            <FormField label="Descripción" fieldId="description" name="description" defaultValue={modal !== 'new' ? modal.description : ''} />
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Categoría</label>
              <select name="category_id" required defaultValue={modal !== 'new' ? modal.category_id : ''} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50">
                <option value="">Seleccione...</option>
                {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Precio" fieldId="price" name="price" type="number" required defaultValue={modal !== 'new' ? String(modal.price) : ''} />
              <FormField label="Stock Base" fieldId="stock_quantity" name="stock_quantity" type="number" required defaultValue={modal !== 'new' ? String(modal.stock_quantity) : '0'} />
            </div>

            <FormField label="URL de Imagen (Opcional)" fieldId="image_url" name="image_url" defaultValue={modal !== 'new' ? modal.image_url : ''} />

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Estado</label>
              <select name="status" defaultValue={modal !== 'new' ? modal.status : 'ACTIVE'} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50">
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </div>

            <Button type="submit" className="w-full mt-4" loading={createMut.isPending || updateMut.isPending}>Guardar Producto</Button>
          </form>
        </div>
      )}
    </DashboardTemplate>
  );
}
