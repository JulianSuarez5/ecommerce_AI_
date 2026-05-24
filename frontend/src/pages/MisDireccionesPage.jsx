import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { addressService } from '../services/addressService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function MisDireccionesPage() {
  const navigate = useNavigate();
  const [direcciones, setDirecciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ alias: '', calle: '', numero: '', ciudad: '', departamento: '', codigoPostal: '', referencia: '', esPrincipal: false });

  const fetchDirecciones = () => {
    addressService.getAll()
      .then((data) => setDirecciones(Array.isArray(data) ? data : []))
      .catch(() => setDirecciones([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDirecciones(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.alias || !form.calle || !form.ciudad || !form.departamento) {
      toast.error('Completa los campos obligatorios');
      return;
    }
    try {
      if (editing) {
        await addressService.update(editing.id, form);
        toast.success('Dirección actualizada');
      } else {
        await addressService.create(form);
        toast.success('Dirección agregada');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ alias: '', calle: '', numero: '', ciudad: '', departamento: '', codigoPostal: '', referencia: '', esPrincipal: false });
      fetchDirecciones();
    } catch {
      toast.error('Error al guardar la dirección');
    }
  };

  const handleEdit = (dir) => {
    setEditing(dir);
    setForm({ alias: dir.alias, calle: dir.calle, numero: dir.numero || '', ciudad: dir.ciudad, departamento: dir.departamento, codigoPostal: dir.codigoPostal || '', referencia: dir.referencia || '', esPrincipal: dir.esPrincipal || false });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta dirección?')) return;
    try {
      await addressService.delete(id);
      toast.success('Dirección eliminada');
      fetchDirecciones();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm({ alias: '', calle: '', numero: '', ciudad: '', departamento: '', codigoPostal: '', referencia: '', esPrincipal: false });
  };

  if (loading) return <div className="min-h-screen bg-surface-secondary pt-20 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-secondary pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-ink">Mis direcciones</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-[800] text-ink">Mis direcciones</h1>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm({ alias: '', calle: '', numero: '', ciudad: '', departamento: '', codigoPostal: '', referencia: '', esPrincipal: false }); }} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Nueva dirección</button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="bg-surface rounded-xl border border-border p-6 mb-6">
              <h2 className="text-lg font-bold text-ink mb-4">{editing ? 'Editar dirección' : 'Nueva dirección'}</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Alias *</label>
                  <input value={form.alias} onChange={(e) => setForm({ ...form, alias: e.target.value })} placeholder="Ej: Casa, Trabajo" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Calle *</label>
                  <input value={form.calle} onChange={(e) => setForm({ ...form, calle: e.target.value })} placeholder="Nombre de la calle" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Número</label>
                  <input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} placeholder="#123" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Ciudad *</label>
                  <input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} placeholder="Ciudad" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Departamento *</label>
                  <input value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} placeholder="Departamento" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Código postal</label>
                  <input value={form.codigoPostal} onChange={(e) => setForm({ ...form, codigoPostal: e.target.value })} placeholder="00000" className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-ink-tertiary mb-1 block">Referencia</label>
                  <input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} placeholder="Cerca de..." className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface-secondary text-ink outline-none focus:border-accent-500" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="esPrincipal" checked={form.esPrincipal} onChange={(e) => setForm({ ...form, esPrincipal: e.target.checked })} className="rounded border-border" />
                  <label htmlFor="esPrincipal" className="text-sm text-ink">Marcar como dirección principal</label>
                </div>
                <div className="sm:col-span-2 flex gap-3">
                  <button type="submit" className="btn-primary">{editing ? 'Actualizar' : 'Guardar'}</button>
                  <button type="button" onClick={handleCancel} className="px-4 py-2 text-sm rounded-lg border border-border text-ink-tertiary hover:bg-surface-tertiary transition-colors">Cancelar</button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {direcciones.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <MapPin size={32} className="text-ink-tertiary" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">No tienes direcciones guardadas</h3>
            <p className="text-sm text-ink-tertiary mb-6">Agrega una dirección para agilizar tus compras.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2"><Plus size={16} /> Agregar dirección</button>
          </div>
        ) : (
          <div className="space-y-4">
            {direcciones.map((dir) => (
              <div key={dir.id} className="bg-surface rounded-xl border border-border p-5 hover:bg-surface-tertiary transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center shrink-0">
                      <Home size={18} className="text-accent-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-ink">{dir.alias}</span>
                        {dir.esPrincipal && <span className="badge text-[10px] bg-accent-500/20 text-accent-500">Principal</span>}
                      </div>
                      <p className="text-sm text-ink-tertiary mt-1">{dir.calle}{dir.numero ? ` #${dir.numero}` : ''}, {dir.ciudad}, {dir.departamento}</p>
                      {dir.codigoPostal && <p className="text-xs text-ink-tertiary mt-0.5">CP: {dir.codigoPostal}</p>}
                      {dir.referencia && <p className="text-xs text-ink-tertiary mt-0.5">Ref: {dir.referencia}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleEdit(dir)} className="p-2 rounded-lg hover:bg-surface-secondary transition-colors" aria-label="Editar"><Edit2 size={14} className="text-ink-tertiary" /></button>
                    <button onClick={() => handleDelete(dir.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" aria-label="Eliminar"><Trash2 size={14} className="text-red-500" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
