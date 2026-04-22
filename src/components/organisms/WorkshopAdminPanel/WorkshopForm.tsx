import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Label } from '@/components/atoms/Label/Label';
import { Textarea } from '@/components/atoms/Textarea/Textarea';
import { getWorkshopCategories } from '@/services/categories.service';
import type { Category } from '@/services/categories.service';
import { createWorkshop } from '@/services/workshops.service';

interface WorkshopFormProps {
  onClose: () => void;
}

export const WorkshopForm: React.FC<WorkshopFormProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    name: '',
    category_id: '',
    description: '',
    duration_minutes: '',
    max_capacity: '',
    price: '',
    instructor_name: '',
    schedule_date: '',
    start_time: '',
    end_time: '',
    available_slots: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getWorkshopCategories().then(setCategories);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const duration = Number(form.duration_minutes);
    const capacity = Number(form.max_capacity);
    const price = Number(form.price);
    const slots = Number(form.available_slots);
    if (duration < 0 || capacity < 0 || price < 0 || slots < 0) {
      setError('No se permiten valores negativos en campos numéricos.');
      setLoading(false);
      return;
    }

    try {
      await createWorkshop({
        name: form.name,
        category_id: Number(form.category_id),
        description: form.description,
        duration_minutes: duration,
        max_capacity: capacity,
        price,
        instructor_name: form.instructor_name,
        schedules: [{
          schedule_date: form.schedule_date,
          start_time: form.start_time,
          end_time: form.end_time,
          available_slots: slots,
        }],
      });
      onClose();
    } catch (err: any) {
      setError('Error al crear el taller: ' + (err?.message || '')); // Mejor manejo de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Cerrar panel"
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <form
        className="absolute inset-y-0 right-0 w-full sm:w-[30rem] glass !rounded-none !rounded-l-3xl p-6 overflow-y-auto shadow-2xl border-l border-white/30"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">Nuevo Taller</h2>
          <Button type="button" variant="ghost" size="sm" onClick={onClose} icon={<X size={16} />}>
            Cerrar
          </Button>
        </div>
        <div className="mb-4">
          <FormField
            label="Nombre del taller"
            fieldId="ws-name"
            name="name"
            placeholder="Ej: Curso de Barismo"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4">
          {categories.length === 0 ? (
            <div className="text-red-500 text-sm text-center bg-white/60 rounded-xl py-2">No hay categorías de taller disponibles. Crea una categoría tipo WORKSHOP primero.</div>
          ) : (
            <>
              <Label htmlFor="ws-category" required>Categoría</Label>
              <select id="ws-category" name="category_id" value={form.category_id} onChange={handleChange} required className="w-full px-4 py-2.5 rounded-xl border bg-white/60 text-text-primary">
                <option value="">Selecciona categoría</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                ))}
              </select>
            </>
          )}
        </div>
        <div className="mb-4">
          <Label htmlFor="ws-description">Descripción</Label>
          <Textarea name="description" placeholder="Descripción" value={form.description} onChange={handleChange} rows={3} />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <FormField
            label="Duración (min)"
            fieldId="ws-duration"
            name="duration_minutes"
            type="number"
            min={0}
            value={form.duration_minutes}
            onChange={handleChange}
            required
          />
          <FormField
            label="Cupo máximo"
            fieldId="ws-max-capacity"
            name="max_capacity"
            type="number"
            min={0}
            value={form.max_capacity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <FormField
            label="Precio"
            fieldId="ws-price"
            name="price"
            type="number"
            min={0}
            step="0.01"
            value={form.price}
            onChange={handleChange}
            required
          />
          <FormField
            label="Instructor"
            fieldId="ws-instructor"
            name="instructor_name"
            placeholder="Nombre del instructor"
            value={form.instructor_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <FormField
            label="Fecha"
            fieldId="ws-date"
            name="schedule_date"
            type="date"
            value={form.schedule_date}
            onChange={handleChange}
            required
          />
          <FormField
            label="Cupos disponibles"
            fieldId="ws-available-slots"
            name="available_slots"
            type="number"
            min={0}
            value={form.available_slots}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-4 grid grid-cols-2 gap-3">
          <FormField
            label="Hora inicio"
            fieldId="ws-start-time"
            name="start_time"
            type="time"
            value={form.start_time}
            onChange={handleChange}
            required
          />
          <FormField
            label="Hora fin"
            fieldId="ws-end-time"
            name="end_time"
            type="time"
            value={form.end_time}
            onChange={handleChange}
            required
          />
        </div>
        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}
        <div className="flex gap-2 justify-end mt-6">
          <Button type="button" onClick={onClose} disabled={loading} variant="ghost" size="md">Cancelar</Button>
          <Button type="submit" disabled={loading || categories.length === 0} variant="primary" size="md">{loading ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </form>
    </div>
  );
};
