import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, X, QrCode } from 'lucide-react';

import { DashboardTemplate } from '@/components/templates/DashboardTemplate/DashboardTemplate';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
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
  const [search, setSearch] = useState('');
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

  const [activeSector, setActiveSector] = useState<string>('TODOS');
  
  const freeTables = tables?.filter(t => t.status === 'FREE').length || 0;
  const occupiedTables = tables?.filter(t => t.status === 'OCCUPIED').length || 0;

  // Get unique labels as sectors
  const sectors = ['TODOS', ...Array.from(new Set(tables?.map(t => t.label || 'SIN ÁREA') || []))];

  const filteredTables = tables?.filter(t => {
    const matchesSector = activeSector === 'TODOS' || (t.label || 'SIN ÁREA') === activeSector;
    const matchesSearch = String(t.table_number).includes(search) || t.table_code.toLowerCase().includes(search.toLowerCase());
    return matchesSector && matchesSearch;
  }) || [];

  return (
    <DashboardTemplate title="Gestión de Salón">
      <div className="mb-6">
        <p className="text-sm text-text-secondary">
          Administra las mesas del establecimiento, organízalas por sectores y genera sus códigos QR.
        </p>
      </div>

      {/* Stats Summary */}
      {!isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="glass p-4 !rounded-2xl border-l-4 border-sky">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Total Mesas</p>
            <p className="text-2xl font-display font-bold text-text-primary">{tables?.length || 0}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-sage">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">Disponibles</p>
            <p className="text-2xl font-display font-bold text-green-600">{freeTables}</p>
          </div>
          <div className="glass p-4 !rounded-2xl border-l-4 border-blush">
            <p className="text-xs text-text-secondary font-bold uppercase tracking-wider">En uso</p>
            <p className="text-2xl font-display font-bold text-red-500">{occupiedTables}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar mesa por número o código..." />
        </div>
        {!isLoading && sectors.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {sectors.map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeSector === sector 
                  ? 'bg-text-primary text-white shadow-md' 
                  : 'bg-white/40 text-text-secondary hover:bg-white/60'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-text-primary">
          {activeSector === 'TODOS' ? 'Todas las Mesas' : `Mesas en ${activeSector}`}
        </h2>
        <Button onClick={() => setModal('new')} icon={<Plus size={16} />}>Nueva Mesa</Button>
      </div>

      {isLoading ? (
         <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTables.map((table) => (
            <div key={table.table_id} className={`glass rounded-2xl p-5 flex flex-col gap-4 relative transition-all duration-300 hover:shadow-xl border border-white/20 ${!table.is_active ? 'grayscale opacity-60' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-display font-bold text-text-primary">Mesa {table.table_number}</h3>
                    {!table.is_active && <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded uppercase font-bold">Inactiva</span>}
                  </div>
                  <p className="text-accent-primary text-xs font-bold tracking-widest uppercase">{table.table_code}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => toggleQR(table.table_id)} className={`p-2 rounded-xl transition-colors ${showQR.includes(table.table_id) ? 'bg-blush text-white' : 'hover:bg-white/40 text-text-secondary'}`} title="Ver QR">
                    <QrCode size={18} />
                  </button>
                  <button onClick={() => setModal(table)} className="p-2 rounded-xl hover:bg-white/40 text-text-secondary" title="Editar">
                    <Pencil size={18} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Capacidad</span>
                  <span className="text-sm font-medium text-text-primary">{table.capacity} Personas</span>
                </div>
                <div className="text-right flex flex-col items-end">
                   <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">Estado</span>
                   <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    table.status === 'FREE' ? 'bg-sage/40 text-green-700' :
                    table.status === 'OCCUPIED' ? 'bg-blush/40 text-red-700' : 'bg-lavender/40 text-purple-700'
                  }`}>
                    {table.status === 'FREE' ? 'Libre' : table.status === 'OCCUPIED' ? 'Ocupada' : table.status}
                  </span>
                </div>
              </div>
              
              {showQR.includes(table.table_id) && (
                <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="bg-white/40 p-4 rounded-xl flex justify-center">
                    <QRCard tableNumber={table.table_number} baseUrl={baseUrl} />
                  </div>
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
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Etiqueta / Sector</label>
                <input 
                  name="label" 
                  list="sectors-list" 
                  defaultValue={modal !== 'new' ? modal.label : ''}
                  placeholder="Ej: Terraza, VIP..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                />
                <datalist id="sectors-list">
                  {sectors.filter(s => s !== 'TODOS').map(s => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

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
