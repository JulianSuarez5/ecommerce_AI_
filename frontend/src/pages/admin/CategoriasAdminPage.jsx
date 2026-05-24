import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', descripcion: '', imagenUrl: '' };

export default function CategoriasAdminPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(Array.isArray(data) ? data : []);
    } catch { setCategories([]); }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre || '', descripcion: c.descripcion || '', imagenUrl: c.imagenUrl || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('Nombre requerido'); return; }
    setSaving(true);
    try {
      if (editing) {
        await categoryService.update(editing.id, form);
        toast.success('Categoría actualizada');
      } else {
        await categoryService.create(form);
        toast.success('Categoría creada');
      }
      setModal(false);
      fetchCategories();
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Categoría eliminada');
      fetchCategories();
    } catch { toast.error('Error al eliminar'); }
  };

  const filtered = search ? categories.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase())) : categories;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Categorías</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gestiona las categorías del catálogo</p>
        </div>
        <button onClick={openNew} className="btn btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Nueva categoría</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar categorías..." className="input pl-10 text-sm" />
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? <LoadingSpinner className="py-12" /> : filtered.length === 0 ? (
          <div className="text-center py-12">          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No hay categorías</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                {['Nombre', 'Descripción', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-border" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{c.nombre}</td>
                    <td className="px-5 py-3 max-w-xs truncate" style={{ color: 'var(--text-secondary)' }}>{c.descripcion || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(c)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-lg border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
              <button onClick={() => setModal(false)} className="hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Nombre</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Descripción</label><textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input resize-none" /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Imagen URL</label><input value={form.imagenUrl} onChange={(e) => setForm({ ...form, imagenUrl: e.target.value })} className="input" placeholder="https://..." /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline px-6">Cancelar</button>
                <button type="submit" className="btn btn-primary px-6" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear categoría'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
