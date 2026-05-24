import { useState, useEffect } from 'react';
import { Plus, X, Search, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { purchaseService } from '../../services/purchaseService';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';
import { formatPrecio } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  PENDIENTE: { label: 'Pendiente', color: 'bg-accent-500/20 text-accent-500' },
  CONFIRMADO: { label: 'Confirmado', color: 'bg-info/20 text-info' },
  ENVIADO: { label: 'Enviado', color: 'bg-accent-500/20 text-accent-500' },
  RECIBIDO: { label: 'Recibido', color: 'bg-[var(--success)]/20 text-[var(--success)]' },
  CANCELADO: { label: 'Cancelado', color: 'bg-[var(--error)]/20 text-[var(--error)]' },
};

export default function ComprasAdminPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ supplierId: '', notas: '', items: [] });

  const fetch = async (estado) => {
    setLoading(true);
    try {
      const params = estado ? { estado } : {};
      const d = await purchaseService.getAll(params);
      setOrders(Array.isArray(d) ? d : []);
    } catch { setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { fetch(filterStatus); }, [filterStatus]);

  useEffect(() => {
    supplierService.getAll().then((d) => setSuppliers(Array.isArray(d) ? d : [])).catch(() => {});
    productService.getAll({ page: 0, size: 200 }).then((d) => setProducts(Array.isArray(d) ? d : d.content || [])).catch(() => {});
  }, []);

  const openNew = () => {
    setForm({ supplierId: '', notas: '', items: [{ productId: '', cantidad: 1, costoUnitario: '' }] });
    setModal(true);
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { productId: '', cantidad: 1, costoUnitario: '' }] });
  };

  const removeItem = (idx) => {
    const items = [...form.items];
    items.splice(idx, 1);
    setForm({ ...form, items });
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === 'productId') {
      const p = products.find((pr) => pr.id === Number(value));
      if (p) items[idx].costoUnitario = p.precio || '';
    }
    setForm({ ...form, items });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.supplierId) { toast.error('Selecciona un proveedor'); return; }
    const validItems = form.items.filter((i) => i.productId && i.cantidad > 0 && Number(i.costoUnitario) > 0);
    if (validItems.length === 0) { toast.error('Agrega al menos un producto válido'); return; }
    setSaving(true);
    try {
      await purchaseService.create({
        supplierId: Number(form.supplierId),
        notas: form.notas,
        items: validItems.map((i) => ({
          productId: Number(i.productId),
          cantidad: Number(i.cantidad),
          costoUnitario: Number(i.costoUnitario),
        })),
      });
      toast.success('Orden de compra creada');
      setModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.mensaje || err.message); }
    setSaving(false);
  };

  const filtered = search
    ? orders.filter((o) =>
        o.supplierNombre?.toLowerCase().includes(search.toLowerCase()) ||
        String(o.id).includes(search)
      )
    : orders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Órdenes de compra</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Compra productos a proveedores</p>
        </div>
        <button onClick={openNew} className="btn btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Nueva compra</button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar..." className="input pl-10 text-sm" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input text-sm max-w-[180px]">
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_MAP).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading ? <LoadingSpinner className="py-12" /> : filtered.length === 0 ? (
          <div className="text-center py-12">          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin órdenes de compra</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['#', 'Proveedor', 'Productos', 'Total', 'Estado', 'Fecha', 'Acciones'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const st = STATUS_MAP[o.estado] || STATUS_MAP.PENDIENTE;
                  return (
                    <tr key={o.id} className="border-b border-border" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>#{o.id}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{o.supplierNombre}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{o.items?.length || 0} productos</td>
                      <td className="px-5 py-3 font-semibold" style={{ color: 'var(--accent)' }}>{formatPrecio(o.total)}</td>
                      <td className="px-5 py-3"><span className={`badge text-xs ${st.color}`}>{st.label}</span></td>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{o.fechaCreacion ? new Date(o.fechaCreacion).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3">
                          <button onClick={() => navigate(`/admin/compras/${o.id}`)} className="p-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-tertiary)' }}>
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Nueva orden de compra</h2>
              <button onClick={() => setModal(false)} className="hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Proveedor *</label>
                <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className="input" required>
                  <option value="">Seleccionar proveedor...</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Productos</p>
                  <button type="button" onClick={addItem} className="text-xs font-medium" style={{ color: 'var(--accent)' }}>+ Agregar producto</button>
                </div>
                <div className="space-y-3">
                  {form.items.map((item, idx) => {
                    const selected = products.find((p) => p.id === Number(item.productId));
                    return (
                      <div key={idx} className="flex gap-2 items-start bg-surface-tertiary p-3 rounded-lg border border-border">
                        <div className="flex-1 min-w-0">
                          <select value={item.productId} onChange={(e) => updateItem(idx, 'productId', e.target.value)} className="input text-xs w-full" required>
                            <option value="">Seleccionar producto...</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>{p.nombre} ({p.sku})</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <input type="number" min="1" value={item.cantidad} onChange={(e) => updateItem(idx, 'cantidad', e.target.value)} className="input text-xs text-center" placeholder="Cant" required />
                        </div>
                        <div className="w-28">
                          <input type="number" step="0.01" min="0" value={item.costoUnitario} onChange={(e) => updateItem(idx, 'costoUnitario', e.target.value)} className="input text-xs text-center" placeholder="Costo u." required />
                        </div>
                        {selected && item.cantidad && item.costoUnitario && (
                          <div className="text-xs font-medium pt-2 w-20 text-right" style={{ color: 'var(--accent)' }}>
                            {formatPrecio(Number(item.cantidad) * Number(item.costoUnitario))}
                          </div>
                        )}
                          <button type="button" onClick={() => removeItem(idx)} className="p-2 shrink-0 mt-1 hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={14} /></button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Notas</label>
                <textarea rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} className="input resize-none" placeholder="Notas opcionales..." />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline px-6">Cancelar</button>
                <button type="submit" className="btn btn-primary px-6" disabled={saving}>{saving ? 'Creando...' : 'Crear orden'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
