import { useState } from 'react';
import { Plus, Pencil, UserX, X } from 'lucide-react';
import { Avatar } from '@/components/atoms/Avatar/Avatar';
import { Badge } from '@/components/atoms/Badge/Badge';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { SearchBar } from '@/components/molecules/SearchBar/SearchBar';
import { Spinner } from '@/components/atoms/Spinner/Spinner';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeactivateEmployee } from '@/hooks/useEmployees';
import toast from 'react-hot-toast';
import type { User, Role } from '@/types';

export function EmployeeTable() {
  const { data: employees, isLoading } = useEmployees();
  const createEmp = useCreateEmployee();
  const updateEmp = useUpdateEmployee();
  const deactivateEmp = useDeactivateEmployee();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<User | 'new' | null>(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState<User | null>(null);

  const filtered = employees?.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  ) || [];

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
        }
      );
    } else if (modal && typeof modal === 'object') {
      updateEmp.mutate(
        { id: modal.id, data },
        {
          onSuccess: () => { toast.success('Empleado actualizado'); setModal(null); },
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
              {emp.role}
            </Badge>
            <Badge className={emp.active ? 'bg-sage/60 text-green-700' : 'bg-red-100/80 text-red-600'}>
              {emp.active ? 'Activo' : 'Inactivo'}
            </Badge>
            <div className="flex gap-1">
              <button onClick={() => setModal(emp)} className="p-2 rounded-lg hover:bg-white/40" aria-label="Editar">
                <Pencil size={16} className="text-text-secondary" />
              </button>
              {emp.active && (
                <button onClick={() => setConfirmDeactivate(emp)} className="p-2 rounded-lg hover:bg-red-50/60" aria-label="Desactivar">
                  <UserX size={16} className="text-red-400" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="glass max-w-md w-full p-6 relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-lg text-text-primary">
                {modal === 'new' ? 'Nuevo Empleado' : 'Editar Empleado'}
              </h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-white/40" aria-label="Cerrar">
                <X size={20} className="text-text-secondary" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label="Nombre" fieldId="emp-name" name="name" required defaultValue={modal !== 'new' ? modal.name : ''} />
              <FormField label="Email" fieldId="emp-email" name="email" type="email" required defaultValue={modal !== 'new' ? modal.email : ''} />
              {modal === 'new' && <FormField label="Contraseña" fieldId="emp-pass" name="password" type="password" required />}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Rol</label>
                <select
                  name="role"
                  defaultValue={modal !== 'new' ? modal.role : 'EMPLOYEE'}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-white/50 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                >
                  <option value="EMPLOYEE">Empleado</option>
                  <option value="ADMIN">Administrador</option>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setConfirmDeactivate(null)} />
          <div className="glass max-w-sm w-full p-6 relative z-10 text-center">
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
    </>
  );
}
