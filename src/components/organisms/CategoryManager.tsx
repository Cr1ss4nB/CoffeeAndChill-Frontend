import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, FolderTree } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { FormField } from '@/components/molecules/FormField/FormField';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/services/categories.service';
import type { Category } from '@/services/categories.service';
import toast from 'react-hot-toast';

interface CategoryManagerProps {
  onClose: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ onClose }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [form, setForm] = useState({
    category_name: '',
    type: 'PRODUCT' as Category['type'],
    description: '',
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      category_name: cat.category_name,
      type: cat.type,
      description: cat.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de desactivar esta categoría?')) return;
    try {
      await deleteCategory(id);
      toast.success('Categoría desactivada');
      loadCategories();
    } catch (err) {
      toast.error('Error al desactivar categoría');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.category_id, form);
        toast.success('Categoría actualizada');
      } else {
        await createCategory(form);
        toast.success('Categoría creada');
      }
      setShowForm(false);
      setEditingCategory(null);
      setForm({ category_name: '', type: 'PRODUCT', description: '' });
      loadCategories();
    } catch (err) {
      toast.error('Error al guardar categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="glass w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col !rounded-3xl shadow-2xl border border-white/30">
        <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/40">
          <div className="flex items-center gap-2">
            <FolderTree className="text-blush" size={24} />
            <h2 className="text-xl font-bold text-text-primary font-display">Gestión de Categorías</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/40 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!showForm ? (
            <>
              <div className="flex justify-end">
                <Button onClick={() => setShowForm(true)} icon={<Plus size={16} />} variant="primary" size="sm">
                  Nueva Categoría
                </Button>
              </div>

              <div className="grid gap-3">
                {categories.map((cat) => (
                  <div key={cat.category_id} className={`glass p-4 !rounded-2xl flex items-center justify-between group transition-all hover:scale-[1.01] ${!cat.is_active ? 'opacity-50 grayscale' : ''}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-text-primary">{cat.category_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          cat.type === 'PRODUCT' ? 'bg-sky/20 text-sky-700' : 
                          cat.type === 'WORKSHOP' ? 'bg-blush/20 text-blush-700' : 
                          'bg-sage/20 text-sage-700'
                        }`}>
                          {cat.type}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">{cat.description || 'Sin descripción'}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-white/60 rounded-lg text-text-secondary hover:text-sky transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(cat.category_id)} className="p-2 hover:bg-white/60 rounded-lg text-text-secondary hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                {categories.length === 0 && !loading && (
                  <div className="text-center py-12 text-text-secondary">
                    No hay categorías registradas.
                  </div>
                )}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-bold text-text-primary">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
              
              <FormField 
                label="Nombre de la categoría" 
                fieldId="cat-name" 
                name="category_name" 
                value={form.category_name} 
                onChange={handleChange} 
                required 
                placeholder="Ej: Cafetería, Talleres Creativos, etc."
              />

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Tipo de Categoría</label>
                <select 
                  name="type" 
                  value={form.type} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 rounded-xl border bg-white/60 text-text-primary border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                  required
                >
                  <option value="PRODUCT">PRODUCT (Menú/Venta)</option>
                  <option value="WORKSHOP">WORKSHOP (Talleres)</option>
                  <option value="INGREDIENT">INGREDIENT (Insumos/Stock)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1">Descripción</label>
                <textarea 
                  name="description" 
                  value={form.description} 
                  onChange={handleChange} 
                  className="w-full px-4 py-2.5 rounded-xl border bg-white/60 text-text-primary border-white/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                  rows={3}
                  placeholder="Opcional..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setEditingCategory(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
