import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPrecio, formatFecha } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const STATUS_STYLES = {
  PENDIENTE: 'bg-accent-500/20 text-accent-500',
  CONFIRMADO: 'bg-blue-500/20 text-blue-400',
  ENVIADO: 'bg-purple-500/20 text-purple-400',
  ENTREGADO: 'bg-[var(--success)]/20 text-[var(--success)]',
  CANCELADO: 'bg-[var(--error)]/20 text-[var(--error)]',
};

export default function MisPedidosPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders({ pagina: 0, tamano: 20 })
      .then((data) => setOrders(data.content || data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-surface-secondary pt-20 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen bg-surface-secondary pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-ink">Mis pedidos</span>
        </div>

        <h1 className="text-3xl font-[800] text-ink mb-8">Mis pedidos</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
              <Package size={32} className="text-ink-tertiary" />
            </div>
            <h3 className="text-lg font-bold text-ink mb-2">No tienes pedidos aún</h3>
            <p className="text-sm text-ink-tertiary mb-6">Explora nuestro catálogo y encuentra lo que necesitas.</p>
            <Link to="/catalogo" className="btn-primary inline-flex items-center gap-2"><ShoppingBag size={16} /> Ir al catálogo</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o) => (
              <Link key={o.id} to={`/mis-pedidos/${o.id}`} className="block bg-surface rounded-lg border border-border p-5 hover:bg-surface-tertiary transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-ink">Pedido #{o.id}</span>
                    <span className={`badge text-[10px] ${STATUS_STYLES[o.estado] || ''}`}>{o.estado}</span>
                  </div>
                  <ChevronRight size={16} className="text-ink-tertiary" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-ink-tertiary">{formatFecha(o.fechaPedido)}</span>
                  <span className="text-accent-500 font-bold">{formatPrecio(o.total)}</span>
                </div>
                {o.detalles && (
                  <div className="flex gap-2 mt-3">
                    {o.detalles.slice(0, 4).map((d, i) => (
                      <div key={i} className="w-10 h-10 rounded bg-surface-tertiary overflow-hidden">
                        <img src={d.imagenPrincipal || ''} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                    ))}
                    {o.detalles.length > 4 && <div className="w-10 h-10 rounded bg-surface-tertiary flex items-center justify-center text-xs text-ink-tertiary">+{o.detalles.length - 4}</div>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
