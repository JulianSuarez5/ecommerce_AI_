import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, Shield, User } from 'lucide-react';
import { userService } from '../../services/userService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  nombre: '', segundoNombre: '', apellido: '', segundoApellido: '',
  email: '', password: '', telefono: '',
  calle: '', numero: '', ciudad: '', departamento: '', codigoPostal: '', referencia: '',
  rol: 'ROLE_CLIENT',
};

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try { const d = await userService.getAll(); setUsers(Array.isArray(d) ? d : []); }
    catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (u) => {
    setEditing(u);
    setForm({
      nombre: u.nombre || '', segundoNombre: u.segundoNombre || '', apellido: u.apellido || '', segundoApellido: u.segundoApellido || '',
      email: u.email || '', password: '', telefono: u.telefono || '',
      calle: u.calle || '', numero: u.numero || '', ciudad: u.ciudad || '', departamento: u.departamento || '', codigoPostal: u.codigoPostal || '', referencia: u.referencia || '',
      rol: isAdmin(u) ? 'ROLE_ADMIN' : 'ROLE_CLIENT',
    });
    setModal(true);
  };
  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    try { await userService.delete(id); toast.success('Usuario eliminado'); fetch(); }
    catch { toast.error('Error al eliminar'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('Nombre requerido'); return; }
    if (!form.apellido.trim()) { toast.error('Apellido requerido'); return; }
    if (!form.email.trim()) { toast.error('Email requerido'); return; }
    if (!form.password.trim() && !editing) { toast.error('Contraseña requerida'); return; }
    setSaving(true);
    try {
      if (editing) {
        await userService.update(editing.id, form);
        toast.success('Usuario actualizado');
      } else {
        await userService.create(form);
        toast.success('Usuario creado');
      }
      setModal(false);
      fetch();
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  const isAdmin = (u) => u.roles?.includes('ROLE_ADMIN');
  const isClient = (u) => u.roles?.includes('ROLE_CLIENT');

  const filtered = search
    ? users.filter((u) =>
        u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        u.apellido?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Usuarios</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gestiona administradores y clientes</p>
        </div>
        <button onClick={openNew} className="btn btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Nuevo usuario</button>
      </div>
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar usuarios..." className="input pl-10 text-sm" />
      </div>
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? <LoadingSpinner className="py-12" /> : filtered.length === 0 ? (
          <div className="text-center py-12">          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin usuarios</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Nombre', 'Email', 'Teléfono', 'Rol', 'Estado', 'Registro', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-border" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: isAdmin(u) ? 'var(--accent)' : 'var(--bg-secondary)', opacity: isAdmin(u) ? 0.2 : 1, color: isAdmin(u) ? 'var(--accent)' : 'var(--text-secondary)' }}>
                          {isAdmin(u) ? <Shield size={14} /> : <User size={14} />}
                        </div>
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.nombre} {u.apellido}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{u.telefono || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="badge text-xs" style={{ background: isAdmin(u) ? 'var(--accent)' : 'var(--bg-secondary)', opacity: isAdmin(u) ? 0.2 : 1, color: isAdmin(u) ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {isAdmin(u) ? 'Admin' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge text-xs" style={{ background: u.activo ? 'var(--success)' : 'var(--error)', opacity: 0.2, color: u.activo ? 'var(--success)' : 'var(--error)' }}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(u.id)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}><Trash2 size={14} /></button>
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
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar usuario' : 'Nuevo usuario'}</h2>
              <button onClick={() => setModal(false)} className="hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Información personal</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Nombre *</label><input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Segundo nombre</label><input value={form.segundoNombre} onChange={(e) => setForm({ ...form, segundoNombre: e.target.value })} className="input" /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Apellido *</label><input value={form.apellido} onChange={(e) => setForm({ ...form, apellido: e.target.value })} className="input" required /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Segundo apellido</label><input value={form.segundoApellido} onChange={(e) => setForm({ ...form, segundoApellido: e.target.value })} className="input" /></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Acceso</p>
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required /></div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Contraseña {editing ? '(dejar vacío para no cambiar)' : '*'}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" required={!editing} /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Teléfono</label><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="input" /></div>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Rol</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setForm({ ...form, rol: 'ROLE_ADMIN' })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all"
                    style={{
                      borderColor: form.rol === 'ROLE_ADMIN' ? 'var(--accent)' : 'var(--border-color)',
                      background: form.rol === 'ROLE_ADMIN' ? 'var(--accent)' : 'transparent',
                      opacity: form.rol === 'ROLE_ADMIN' ? 0.12 : 1,
                      color: form.rol === 'ROLE_ADMIN' ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}>
                    <Shield size={16} /> Administrador
                  </button>
                  <button type="button" onClick={() => setForm({ ...form, rol: 'ROLE_CLIENT' })}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium transition-all"
                    style={{
                      borderColor: form.rol === 'ROLE_CLIENT' ? 'var(--accent)' : 'var(--border-color)',
                      background: form.rol === 'ROLE_CLIENT' ? 'var(--accent)' : 'transparent',
                      opacity: form.rol === 'ROLE_CLIENT' ? 0.12 : 1,
                      color: form.rol === 'ROLE_CLIENT' ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}>
                    <User size={16} /> Cliente
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Dirección (opcional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Calle</label><input value={form.calle} onChange={(e) => setForm({ ...form, calle: e.target.value })} className="input" /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Número</label><input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} className="input" /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Ciudad</label><input value={form.ciudad} onChange={(e) => setForm({ ...form, ciudad: e.target.value })} className="input" /></div>
                  <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Departamento</label><input value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} className="input" /></div>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline px-6">Cancelar</button>
                <button type="submit" className="btn btn-primary px-6" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear usuario'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
