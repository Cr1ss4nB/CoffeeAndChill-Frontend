import { useState } from 'react';
import { Plus, Pencil, UserX, X, History, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeactivateEmployee } from '@/hooks/useEmployees';
import { useInventoryMovements } from '@/hooks/useInventory';
import toast from 'react-hot-toast';
import type { User, Role } from '@/types';

export function EmployeeTable() {
  const { data: employees, isLoading, isError } = useEmployees();
  const createEmp = useCreateEmployee();
  const updateEmp = useUpdateEmployee();
  const deactivateEmp = useDeactivateEmployee();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<User | 'new' | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);
  const [showHistory, setShowHistory] = useState<User | null>(null);

  const filtered = employees?.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

  console.log('DEBUG UI - Empleados cargados:', employees);
  console.log('DEBUG UI - Empleados filtrados:', filtered);

  function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      email: fd.get('email') as string,
      role: fd.get('role') as Role,
      active: true,
    };

    if (modal === 'new') {
      createEmp.mutate(
        { ...data, password: fd.get('password') as string },
        {
          onSuccess: () => { toast.success('Empleado creado'); setModal(null); },
          onError: (err: any) => { toast.error(err.response?.data?.detail || 'Error creando empleado'); }
        }
      );
    } else if (modal && typeof modal === 'object') {
      updateEmp.mutate(
        { id: modal.id, data },
        {
          onSuccess: () => { toast.success('Empleado actualizado'); setModal(null); },
          onError: (err: any) => { toast.error(err.response?.data?.detail || 'Error actualizando empleado'); }
        }
      );
    }
  }

  function handleDeactivate() {
    if (!confirmDeactivate) return;
    deactivateEmp.mutate(confirmDeactivate.id, {
      onSuccess: () => { toast.success('Empleado desactivado'); setConfirmDeactivate(null); },
    });
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return <p className="text-center py-8 text-red-500">No fue posible cargar empleados. Verifica permisos o sesión.</p>;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchBar value={search} onChange={setSearch} placeholder="Buscar empleado..." /></div>
        <Button size="sm" onClick={() => setModal('new')} icon={<Plus size={14} />}>Agregar</Button>
      </div>

      <div className="space-y-2">
        {filtered.map((emp) => (
          <div key={emp.id} className={`glass !rounded-xl p-4 flex items-center gap-4 ${!emp.active ? 'opacity-50' : ''}`}>
            <Avatar name={emp.name} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-text-primary">{emp.name}</p>
              <p className="text-xs text-text-secondary">{emp.email}</p>
            </div>
            <Badge className={emp.role === 'ADMIN' ? 'bg-lavender/60 text-purple-700' : 'bg-sky/60 text-sky-700'}>
              {emp.role.toUpperCase()}
            </Badge>
            <Badge className={emp.active ? 'bg-sage/60 text-green-700' : 'bg-red-100/80 text-red-600'}>
              {emp.active ? 'Activo' : 'Inactivo'}
            </Badge>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="!p-2" onClick={() => setModal(emp)} aria-label="Editar" icon={<Pencil size={16} className="text-text-secondary" />}>
                <span className="sr-only">Editar</span>
              </Button>
              <Button variant="ghost" size="sm" className="!p-2" onClick={() => setShowHistory(emp)} aria-label="Historial" icon={<History size={16} className="text-text-secondary" />}>
                <span className="sr-only">Historial</span>
              </Button>
              {emp.active && (
                <Button variant="ghost" size="sm" className="!p-2 hover:!bg-red-50/60" onClick={() => setConfirmDeactivate(emp)} aria-label="Desactivar" icon={<UserX size={16} className="text-red-400" />}>
                  <span className="sr-only">Desactivar</span>
                </Button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && !isLoading && (
          <div className="glass p-8 text-center !rounded-2xl">
            <p className="text-text-secondary text-sm">No se encontraron empleados.</p>
            <p className="text-text-secondary text-xs mt-1">Usa el botón "Agregar" para registrar al personal.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar panel"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setModal(null)}
          />
          <div className="absolute inset-y-0 right-0 w-full sm:w-[30rem] glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl border-l border-white/30">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-text-primary">
                {modal === 'new' ? 'Nuevo Empleado' : 'Editar Empleado'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setModal(null)} icon={<X size={16} />}>
                Cerrar
              </Button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Nombre" fieldId="emp-name" name="name" required defaultValue={modal !== 'new' ? modal.name : ''} />
              <FormField label="Email" fieldId="emp-email" name="email" type="email" required defaultValue={modal !== 'new' ? modal.email : ''} />
              {modal === 'new' && <FormField label="Contraseña" fieldId="emp-pass" name="password" type="password" required />}
              <div>
                <label htmlFor="emp-role" className="block text-sm font-medium text-text-primary mb-1">Rol</label>
                <select
                  id="emp-role"
                  name="role"
                  defaultValue={modal !== 'new' ? modal.role.toLowerCase() : 'waiter'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                >
                  <option value="waiter">Mesero</option>
                  <option value="cashier">Cajero</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <Button type="submit" className="w-full" loading={createEmp.isPending || updateEmp.isPending}>
                Guardar
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Confirm deactivation */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Cerrar panel"
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setConfirmDeactivate(null)}
          />
          <div className="absolute inset-y-0 right-0 w-full sm:w-[26rem] glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl border-l border-white/30">
            <h2 className="font-display font-bold text-lg text-text-primary mb-2">Desactivar empleado</h2>
            <p className="text-sm text-text-secondary mb-5">
              ¿Desactivar a <strong>{confirmDeactivate.name}</strong>? No podrá acceder al sistema.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setConfirmDeactivate(null)}>Cancelar</Button>
              <Button variant="danger" className="flex-1" onClick={handleDeactivate} loading={deactivateEmp.isPending}>Desactivar</Button>
            </div>
          </div>
        </div>
      )}
      {/* Employee History Modal */}
      {showHistory && (
        <EmployeeHistoryModal 
          user={showHistory} 
          onClose={() => setShowHistory(null)} 
        />
      )}
    </>
  );
}

function EmployeeHistoryModal({ user, onClose }: { user: User; onClose: () => void }) {
  const { data, isLoading } = useInventoryMovements(1, 10, user.id);
  const movements = data?.items || [];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-full sm:w-[34rem] glass !rounded-none !rounded-l-3xl p-6 shadow-2xl border-l border-white/30 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Historial de Actividad</h2>
            <p className="text-xs text-text-secondary">{user.name} • {user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} icon={<X size={16} />}>
            Cerrar
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="md" /></div>
          ) : movements.length === 0 ? (
            <p className="text-center py-8 text-sm text-text-secondary">Sin movimientos registrados.</p>
          ) : (
            <div className="space-y-3">
              {movements.map((m: any) => (
                <div key={m.movement_id} className="p-3 bg-white/20 rounded-xl border border-white/30 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${m.movement_type === 'IN' ? 'bg-sage/40 text-green-700' : 'bg-blush/40 text-red-600'}`}>
                    {m.movement_type === 'IN' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{m.product_name}</p>
                    <p className="text-[10px] text-text-secondary">
                      {new Date(m.movement_date).toLocaleString('es-CO')} • {m.reason}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${m.movement_type === 'IN' ? 'text-green-700' : 'text-red-600'}`}>
                      {m.movement_type === 'IN' ? '+' : '-'}{m.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
