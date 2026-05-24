import { useState, useEffect } from 'react';
import { Plus, Search, AlertTriangle, X, Package } from 'lucide-react';
import { inventoryService } from '../../services/inventoryService';
import { productService } from '../../services/productService';
import { supplierService } from '../../services/supplierService';
import { formatFecha } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function InventarioAdminPage() {
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('movements');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [modal, setModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ productoId: '', cantidad: '', costoUnitario: '', proveedorId: '', referencia: '' });
  const [saving, setSaving] = useState(false);

  const fetchMovements = async (p = 0) => {
    setLoading(true);
    try {
      const data = await inventoryService.getMovements({ pagina: p, tamano: 20 });
      const items = data.content || data || [];
      setMovements(p === 0 ? items : (prev) => [...prev, ...items]);
      setHasMore(data.totalPages ? p < data.totalPages - 1 : items.length >= 20);
    } catch { if (p === 0) setMovements([]); }
    setLoading(false);
  };

  const fetchAlerts = async () => {
    try { const d = await inventoryService.getAlerts(); setAlerts(Array.isArray(d) ? d : []); }
    catch { setAlerts([]); }
  };

  useEffect(() => {
    if (tab === 'movements') fetchMovements(0);
    if (tab === 'alerts') fetchAlerts();
  }, [tab]);

  const handleEntrada = async (e) => {
    e.preventDefault();
    if (!form.productoId || !form.cantidad) { toast.error('Completa los campos'); return; }
    setSaving(true);
    try {
      await inventoryService.createEntry({
        productoId: Number(form.productoId),
        cantidad: Number(form.cantidad),
        costoUnitario: Number(form.costoUnitario) || null,
        proveedorId: Number(form.proveedorId) || null,
        referencia: form.referencia || null,
      });
      toast.success('Entrada registrada');
      setModal(false);
      setForm({ productoId: '', cantidad: '', costoUnitario: '', proveedorId: '', referencia: '' });
      fetchMovements(0);
      fetchAlerts();
    } catch (err) { toast.error(err.message); }
    setSaving(false);
  };

  const openEntry = async () => {
    try {
      const [p, s] = await Promise.all([
        productService.getAll({ size: 100 }).then((d) => d.content || d || []),
        supplierService.getAll().then((d) => Array.isArray(d) ? d : []),
      ]);
      setProducts(p);
      setSuppliers(s);
      setModal(true);
    } catch { toast.error('Error al cargar datos'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Inventario</h1><p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Control de stock y movimientos</p></div>
        <button onClick={openEntry} className="btn btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Registrar entrada</button>
      </div>

      <div className="flex gap-1 bg-surface rounded-lg p-1 w-fit">
        {[{ key: 'movements', label: 'Movimientos' }, { key: 'alerts', label: `Alertas (${alerts.length})` }].map((t) => (
          <button onClick={() => setTab(t.key)} className="px-4 py-2 rounded text-sm font-medium transition-all" style={{ background: tab === t.key ? 'var(--bg-elevated)' : 'transparent', color: tab === t.key ? 'var(--accent)' : 'var(--text-tertiary)' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'movements' ? (
        <div className="bg-surface rounded-lg border border-border overflow-hidden">
          {loading && page === 0 ? <LoadingSpinner className="py-12" /> : movements.length === 0 ? (
            <div className="text-center py-12">            <Package size={32} className="mx-auto mb-2" style={{ color: 'var(--text-tertiary)' }} /><p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin movimientos</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border">
                  {['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Proveedor', 'Referencia'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b border-border" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                      <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatFecha(m.fechaMovimiento)}</td>
                      <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{m.product?.nombre || `#${m.product?.id}`}</td>
                      <td className="px-5 py-3"><span className="badge text-[10px]" style={{ background: m.tipo === 'ENTRADA' ? 'var(--success)' : 'var(--accent)', opacity: 0.2, color: m.tipo === 'ENTRADA' ? 'var(--success)' : 'var(--accent)' }}>{m.tipo}</span></td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-primary)' }}>{m.cantidad}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{m.supplier?.nombre || '—'}</td>
                      <td className="px-5 py-3" style={{ color: 'var(--text-tertiary)' }}>{m.referencia || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {hasMore && movements.length > 0 && (
            <div className="text-center py-4 border-t border-border">
              <button onClick={() => { const n = page + 1; setPage(n); fetchMovements(n); }} className="text-sm font-medium" style={{ color: 'var(--accent)' }} disabled={loading}>
                {loading ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-surface rounded-lg border border-border p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--success)]/20 flex items-center justify-center"><Package size={24} className="text-[var(--success)]" /></div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sin alertas de stock</p>
              <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Todos los productos tienen stock suficiente</p>
            </div>
          ) : (
            alerts.map((p) => (
              <div key={p.id} className="bg-surface rounded-lg border border-border p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--error)]/10 flex items-center justify-center"><AlertTriangle size={20} className="text-[var(--error)]" /></div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{p.nombre}</p>
                    <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Stock: {p.stock} / Mínimo: {p.stockMinimo}</p>
                  </div>
                </div>
                <button onClick={openEntry} className="btn btn-primary text-xs px-4 py-2">Crear orden</button>
              </div>
            ))
          )}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative bg-surface rounded-lg border border-border w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Entrada de inventario</h2>
              <button onClick={() => setModal(false)} className="hover:opacity-80" style={{ color: 'var(--text-tertiary)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleEntrada} className="p-6 space-y-4">
              <div>                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Producto *</label>
                <select value={form.productoId} onChange={(e) => setForm({ ...form, productoId: e.target.value })} className="input" required>
                  <option value="">Seleccionar...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Cantidad *</label><input type="number" min="1" value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: e.target.value })} className="input" required /></div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Costo unitario</label><input type="number" min="0" value={form.costoUnitario} onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })} className="input" /></div>
              </div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Proveedor</label>
                <select value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })} className="input">
                  <option value="">Sin proveedor</option>
                  {suppliers.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
              </div>
                <div><label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Referencia</label><input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} className="input" placeholder="Factura o nota" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn btn-outline px-6">Cancelar</button>
                <button type="submit" className="btn btn-primary px-6" disabled={saving}>{saving ? 'Registrando...' : 'Registrar entrada'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
