import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatPrecio, formatFecha } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUS_STYLES = {
  PENDIENTE: 'bg-accent-500/15 text-accent-500',
  CONFIRMADO: 'bg-purple/15 text-purple',
  ENVIADO: 'bg-blue/15 text-blue',
  ENTREGADO: 'bg-[var(--success)]/15 text-[var(--success)]',
  CANCELADO: 'bg-[var(--error)]/15 text-[var(--error)]',
};

export default function PedidosAdminPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [estadoFilter, setEstadoFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async (p = 0, append = false) => {
    setLoading(true);
    try {
      const params = { pagina: p, tamano: 20 };
      if (estadoFilter) params.estado = estadoFilter;
      const data = await orderService.adminGetAll(params);
      const items = data.content || data || [];
      setOrders(append ? (prev) => [...prev, ...items] : items);
      setHasMore(data.totalPages ? p < data.totalPages - 1 : items.length >= 20);
    } catch { if (!append) setOrders([]); }
    setLoading(false);
  };

  useEffect(() => { setPage(0); fetchOrders(0); }, [estadoFilter]);

  const filtered = searchTerm
    ? orders.filter((o) =>
        String(o.id).includes(searchTerm) ||
        (o.userNombre || '').toLowerCase().includes(searchTerm.toLowerCase()))
    : orders;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Pedidos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Gestiona los pedidos de la tienda</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="text" placeholder="Buscar por ID o cliente..." className="input pl-10 text-sm" />
        </div>
        <select value={estadoFilter} onChange={(e) => setEstadoFilter(e.target.value)} className="input text-sm max-w-[180px]">
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ENTREGADO">Entregado</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        {loading && page === 0 ? <LoadingSpinner className="py-12" /> : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No se encontraron pedidos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface border-b border-border">
                  {['ID', 'Cliente', 'Fecha', 'Total', 'Estado', 'Acción'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border transition-colors duration-200" style={{ transition: 'background 100ms ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                    <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>#{o.id}</td>
                    <td className="px-5 py-3" style={{ color: 'var(--text-secondary)' }}>{o.userNombre || '—'}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>{formatFecha(o.fechaPedido)}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: 'var(--accent)' }}>{formatPrecio(o.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_STYLES[o.estado] || 'bg-surface-tertiary text-ink-tertiary'}`}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Link to={`/admin/pedidos/${o.id}`} className="text-xs font-medium transition-colors flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                        Ver detalle <ChevronRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {hasMore && filtered.length > 0 && (
          <div className="text-center py-4 border-t border-border">
            <button onClick={() => { const n = page + 1; setPage(n); fetchOrders(n, true); }} className="text-sm font-medium transition-colors" style={{ color: 'var(--accent)' }} disabled={loading}>
              {loading ? 'Cargando...' : 'Cargar más'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
