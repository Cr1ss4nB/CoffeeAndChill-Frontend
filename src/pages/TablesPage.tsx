import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, X, QrCode } from 'lucide-react';
import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { QRCard } from '@/components/molecules/QRCard/QRCard';
import api from '@/api/api.client';
import toast from 'react-hot-toast';

interface TableSpot {
  table_id: number;
  table_number: number;
  table_code: string;
  capacity: number;
  label?: string;
  status: string;
  is_active: boolean;
}

export default function TablesPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState<TableSpot | 'new' | null>(null);
  const [showQR, setShowQR] = useState<number[]>([]);
  const baseUrl = window.location.origin;

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await api.get<TableSpot[]>('/tables');
      return response.data;
    },
  });

  const createMut = useMutation({
    mutationFn: (data: any) => api.post('/tables', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Mesa creada'); setModal(null); },
    onError: (err: any) => { toast.error(err.response?.data?.detail || 'Error creando mesa'); }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.put(`/tables/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Mesa actualizada'); setModal(null); },
    onError: (err: any) => { toast.error(err.response?.data?.detail || 'Error actualizando mesa'); }
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => api.delete(`/tables/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tables'] }); toast.success('Mesa desactivada'); },
  });

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      table_number: Number(fd.get('table_number')),
      capacity: Number(fd.get('capacity')),
      label: fd.get('label') as string,
      status: fd.get('status') as string,
    };

    if (modal === 'new') {
      createMut.mutate(data);
    } else if (modal && typeof modal === 'object') {
      updateMut.mutate({ id: modal.table_id, data });
    }
  }

  function toggleQR(id: number) {
    if (showQR.includes(id)) {
      setShowQR(showQR.filter((i) => i !== id));
    } else {
      setShowQR([...showQR, id]);
    }
  }

  return (
    <DashboardTemplate title="Gestión de Mesas y QR">
      <div className="flex justify-between items-center mb-6">
        <p className="text-text-secondary">Administra las ubicaciones y genera códigos QR para pedidos desde mesa.</p>
        <Button onClick={() => setModal('new')} icon={<Plus size={16} />}>Nueva Mesa</Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables?.map((table) => (
            <div key={table.table_id} className="glass rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-display font-bold text-text-primary">Mesa {table.table_number}</h3>
                  <p className="text-accent-primary text-sm font-bold tracking-wider">{table.table_code} • {table.capacity} pax</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleQR(table.table_id)} className="p-2 rounded-lg hover:bg-white/40 text-text-secondary" aria-label="QR">
                    <QrCode size={18} />
                  </button>
                  <button onClick={() => setModal(table)} className="p-2 rounded-lg hover:bg-white/40 text-text-secondary" aria-label="Editar">
                    <Pencil size={18} />
                  </button>
                  <button onClick={() => { if(confirm('¿Desactivar esta mesa?')) deleteMut.mutate(table.table_id); }} className="p-2 rounded-lg hover:bg-red-50/60 text-red-400" aria-label="Eliminar">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  table.status === 'FREE' ? 'bg-sage/40 text-green-700' :
                  table.status === 'OCCUPIED' ? 'bg-blush/40 text-red-700' : 'bg-lavender/40 text-purple-700'
                }`}>
                  {table.status}
                </span>
                <span className="text-xs text-text-secondary">{table.label || 'Sin etiqueta'}</span>
              </div>
              
              {showQR.includes(table.table_id) && (
                <div className="mt-4 border-t border-white/20 pt-4 flex justify-center">
                  <QRCard tableNumber={table.table_number} baseUrl={baseUrl} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="glass max-w-sm w-full p-6 relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-text-primary">
                {modal === 'new' ? 'Nueva Mesa' : 'Editar Mesa'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-white/40"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Número de mesa" fieldId="table_number" name="table_number" type="number" required defaultValue={modal !== 'new' ? String(modal.table_number) : ''} />
              <FormField label="Capacidad (personas)" fieldId="capacity" name="capacity" type="number" required defaultValue={modal !== 'new' ? String(modal.capacity) : ''} />
              <FormField label="Etiqueta / Sector" fieldId="label" name="label" defaultValue={modal !== 'new' ? modal.label : ''} />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Estado</label>
                <select name="status" defaultValue={modal !== 'new' ? modal.status : 'FREE'} className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50">
                  <option value="FREE">Libre</option>
                  <option value="OCCUPIED">Ocupada</option>
                  <option value="RESERVED">Reservada</option>
                  <option value="MAINTENANCE">En mantenimiento</option>
                </select>
              </div>
              <Button type="submit" className="w-full" loading={createMut.isPending || updateMut.isPending}>Guardar</Button>
            </form>
          </div>
        </div>
      )}
    </DashboardTemplate>
  );
}
