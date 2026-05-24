import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search } from 'lucide-react';
import { supplierService } from '../../services/supplierService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', contacto: '', email: '', telefono: '', direccion: '' };

export default function ProveedoresAdminPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const d = await supplierService.getAll(); setSuppliers(Array.isArray(d) ? d : []); }
    catch { setSuppliers([]); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (s) => { setEditing(s); setForm({ nombre: s.nombre || '', contacto: s.contacto || '', email: s.email || '', telefono: s.telefono || '', direccion: s.direccion || '' }); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('Nombre requerido'); return; }
    setSaving(true);
    try {
      if (editing) { await supplierService.update(editing.id, form); toast.success('Actualizado'); }
      else { await supplierService.create(form); toast.success('Creado'); }
      setModal(false); fetch();
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar?')) return;
    try { await supplierService.delete(id); toast.success('Eliminado'); fetch(); }
    catch { toast.error('Error'); }
  };

  const filtered = search ? suppliers.filter((s) => s.nombre.toLowerCase().includes(search.toLowerCase()) || s.contacto?.toLowerCase().includes(search.toLowerCase())) : suppliers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Proveedores</h1><p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gestiona tus proveedores</p></div>
        <button onClick={openNew} className="btn btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Nuevo proveedor</button>
      </div>
      <div className="relative max-w-sm">        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} /><input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar..." className="input pl-10 text-sm" /></div>
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? <LoadingSpinner className="py-12" /> : filtered.length === 0 ? <div className="text-center py-12">          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin proveedores</p></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">{['Nombre', 'Contacto', 'Email', 'Teléfono', 'Acciones'].map((h) => (<th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>))}</tr></thead>
              <tbody>{filtered.map((s) => (
                <tr key={s.id} className="border-b border-border" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{s.nombre}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{s.contacto || '—'}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{s.email || '—'}</td>
                  <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{s.telefono || '—'}</td>
                  <td className="px-5 py-3"><div className="flex gap-2">
                    <button onClick={() => openEdit(s)} className="p-2 hover:opacity-80"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-2 hover:opacity-80"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-lg border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
              <button onClick={() => setModal(false)} className="hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Nombre *</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required /></div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Contacto</label><input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} className="input" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Teléfono</label><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input" /></div>
              </div>
              <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Dirección</label><textarea rows={2} value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })} className="input resize-none" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline px-6">Cancelar</button>
                <button type="submit" className="btn btn-primary px-6" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
