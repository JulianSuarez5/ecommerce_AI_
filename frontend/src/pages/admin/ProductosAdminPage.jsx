import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Search, PlusCircle, MinusCircle, Upload } from 'lucide-react';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';
import { formatPrecio } from '../../utils/format';
import ImageUploader from '../../components/ui/ImageUploader';
import ModelUploader from '../../components/ui/ModelUploader';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const EMPTY_FORM = { nombre: '', sku: '', categoryId: '', brandId: '', precio: '', precioOferta: '', stock: '', stockMinimo: '', descripcionCorta: '', descripcion: '', imagenPrincipal: '', modelo3dUrl: '', colores: '', tags: '', especificaciones: [] };

const COLOR_OPTIONS = [
  { name: 'Negro', value: '#111111' },
  { name: 'Blanco', value: '#f5f5f5' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Beige', value: '#d4a574' },
  { name: 'Marrón', value: '#8B4513' },
];

export default function ProductosAdminPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchProducts = async (p = 0) => {
    setLoading(true);
    try {
      const params = { page: p, size: 10 };
      if (search.trim()) params.busqueda = search;
      const data = await productService.getAll(params);
      const items = data.content || data || [];
      setProducts(p === 0 ? items : (prev) => [...prev, ...items]);
      setHasMore(data.totalPages ? p < data.totalPages - 1 : items.length >= 10);
    } catch { if (p === 0) setProducts([]); }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(0); }, [search]);
  useEffect(() => {
    categoryService.getAll().then((d) => setCategories(Array.isArray(d) ? d : [])).catch(() => {});
    brandService.getAll().then((d) => setBrands(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    let specs = [];
    try { if (p.especificaciones) specs = JSON.parse(p.especificaciones); } catch { specs = []; }
    setForm({
      nombre: p.nombre || '', sku: p.sku || '', categoryId: p.categoryId || p.categoriaId || p.categoria?.id || '',
      brandId: p.brandId || p.brand?.id || '',
      precio: p.precio || '', precioOferta: p.precioOferta || '', stock: p.stock ?? '',
      stockMinimo: p.stockMinimo || '', descripcionCorta: p.descripcionCorta || '',
      descripcion: p.descripcion || '', imagenPrincipal: p.imagenPrincipal || p.imagenUrl || p.imagen || '',
      modelo3dUrl: p.modelo3dUrl || '',
      colores: p.colores || '', tags: p.tags || '', especificaciones: specs.length ? specs : [{ clave: '', valor: '' }],
    });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim()) { toast.error('Nombre requerido'); return; }
    setSaving(true);
    try {
      const validSpecs = form.especificaciones?.filter((s) => s.clave?.trim() && s.valor?.trim()) || [];
      const body = {
        ...form,
        precio: Number(form.precio) || 0,
        precioOferta: Number(form.precioOferta) || null,
        stock: Number(form.stock) || 0,
        stockMinimo: Number(form.stockMinimo) || 0,
        categoryId: Number(form.categoryId) || null,
        brandId: Number(form.brandId) || null,
        especificaciones: validSpecs.length ? JSON.stringify(validSpecs) : null,
      };
      if (editing) {
        await productService.update(editing.id, body);
        toast.success('Producto actualizado');
      } else {
        await productService.create(body);
        toast.success('Producto creado');
      }
      setModal(false);
      setPage(0);
      fetchProducts(0);
    } catch (err) { toast.error(err.message, { duration: 6000 }); }
    setSaving(false);
  };

  const addSpecRow = () => {
    setForm({ ...form, especificaciones: [...(form.especificaciones || []), { clave: '', valor: '' }] });
  };

  const removeSpecRow = (idx) => {
    const specs = [...(form.especificaciones || [])];
    specs.splice(idx, 1);
    setForm({ ...form, especificaciones: specs.length ? specs : [{ clave: '', valor: '' }] });
  };

  const updateSpec = (idx, field, value) => {
    const specs = [...(form.especificaciones || [])];
    specs[idx] = { ...specs[idx], [field]: value };
    setForm({ ...form, especificaciones: specs });
  };

  const toggleColor = (colorName) => {
    const current = form.colores ? form.colores.split(',').map((c) => c.trim()).filter(Boolean) : [];
    const idx = current.indexOf(colorName);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(colorName);
    setForm({ ...form, colores: current.join(',') });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      await productService.delete(id).catch(() => {});
      toast.success('Producto eliminado');
      fetchProducts(0);
    } catch { toast.error('Error al eliminar'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Productos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gestiona tu catálogo</p>
        </div>
        <button onClick={openNew} className="btn btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Nuevo producto</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} type="text" placeholder="Buscar productos..." className="input pl-10 text-sm" />
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading && page === 0 ? <LoadingSpinner className="py-12" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Stock', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border transition-colors duration-200" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="px-5 py-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-tertiary overflow-hidden">
                        <img src={p.imagenPrincipal || p.imagenUrl || p.imagen || ''} alt="" className="w-full h-full object-cover" onError={(e) => { console.warn('Admin product img failed:', e.target.src); e.target.style.display = 'none'; }} />
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium max-w-[200px] truncate" style={{ color: 'var(--text-primary)' }}>{p.nombre}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{p.categoria?.nombre || '—'}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--accent)' }}>{formatPrecio(p.precio)}</td>
                    <td className="px-5 py-3">
                      {(p.stock ?? 0) < 5 ? (
                        <span className="badge" style={{ background: 'var(--error)', opacity: 0.1, color: 'var(--error)' }}>{p.stock ?? 0}</span>
                      ) : (
                        <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.stock ?? 0}</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="badge" style={{ background: (p.stock || 0) > 0 ? 'var(--success)' : 'var(--error)', opacity: 0.2, color: (p.stock || 0) > 0 ? 'var(--success)' : 'var(--error)' }}>
                        {(p.stock || 0) > 0 ? 'Activo' : 'Agotado'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}><Pencil size={14} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && products.length > 0 && (
          <div className="text-center py-4 border-t border-border">
            <button onClick={() => { const n = page + 1; setPage(n); fetchProducts(n); }} className="text-sm font-medium transition-colors" style={{ color: 'var(--accent)' }} disabled={loading}>
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-surface-secondary/85 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-lg border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-5 border-b border-border">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{editing ? 'Editar producto' : 'Nuevo producto'}</h2>
              <button onClick={() => setModal(false)} className="hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Información básica</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Nombre *</label>
                        <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input" required />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>SKU *</label>
                        <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" required />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Categoría *</label>
                      <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input" required>
                        <option value="">Seleccionar...</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Marca</label>
                      <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="input">
                        <option value="">Sin marca</option>
                        {brands.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Precio *</label>
                      <input type="number" step="0.01" min="0" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Precio oferta</label>
                      <input type="number" step="0.01" min="0" value={form.precioOferta} onChange={(e) => setForm({ ...form, precioOferta: e.target.value })} className="input" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Stock</label>
                      <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Stock mínimo</label>
                      <input type="number" min="0" value={form.stockMinimo} onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })} className="input" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Descripción</p>
                    <div className="space-y-3">
                      <input value={form.descripcionCorta} onChange={(e) => setForm({ ...form, descripcionCorta: e.target.value })} className="input" placeholder="Descripción corta" />
                      <textarea rows={3} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input resize-none" placeholder="Descripción completa" />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Colores disponibles</p>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => {
                        const selected = form.colores?.split(',').map((x) => x.trim()).includes(c.name);
                        return (
                          <button key={c.name} type="button" onClick={() => toggleColor(c.name)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                            style={{
                              borderColor: selected ? 'var(--accent)' : 'var(--border-color)',
                              background: selected ? 'var(--accent)' : 'transparent',
                              opacity: selected ? 0.12 : 1,
                              color: selected ? 'var(--accent)' : 'var(--text-tertiary)',
                            }}>
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value, border: '1px solid rgba(255,255,255,0.2)' }} />
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                    {form.colores && <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Seleccionados: {form.colores}</p>}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Especificaciones técnicas</p>
                    <div className="space-y-2">
                      {(form.especificaciones || []).map((spec, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input value={spec.clave} onChange={(e) => updateSpec(idx, 'clave', e.target.value)} className="input flex-1 text-xs" placeholder="Clave" />
                          <input value={spec.valor} onChange={(e) => updateSpec(idx, 'valor', e.target.value)} className="input flex-1 text-xs" placeholder="Valor" />
                          <button type="button" onClick={() => removeSpecRow(idx)} className="p-2 shrink-0 hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><MinusCircle size={16} /></button>
                        </div>
                      ))}
                      <button type="button" onClick={addSpecRow} className="flex items-center gap-1 text-xs transition-colors mt-1" style={{ color: 'var(--accent)' }}>
                        <PlusCircle size={14} /> Agregar especificación
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Tags / Etiquetas</p>
                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="nuevo, oferta, destacado (separados por coma)" />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Imagen principal</label>
                    <ImageUploader value={form.imagenPrincipal} onChange={(url) => setForm({ ...form, imagenPrincipal: url })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Modelo 3D (.glb)</label>
                    <ModelUploader value={form.modelo3dUrl} onChange={(url) => setForm({ ...form, modelo3dUrl: url })} />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-surface py-3">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline px-6">Cancelar</button>
                <button type="submit" className="btn btn-primary px-6" disabled={saving}>{saving ? 'Guardando...' : editing ? 'Guardar cambios' : 'Crear producto'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
