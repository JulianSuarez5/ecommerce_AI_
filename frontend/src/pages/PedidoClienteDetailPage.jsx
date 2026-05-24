import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Package, MapPin, Check } from 'lucide-react';
import { orderService } from '../services/orderService';
import { formatPrecio, formatFecha } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDIENTE: 'bg-accent-500/20 text-accent-500',
  CONFIRMADO: 'bg-blue-500/20 text-blue-400',
  ENVIADO: 'bg-purple-500/20 text-purple-400',
  ENTREGADO: 'bg-[var(--success)]/20 text-[var(--success)]',
  CANCELADO: 'bg-[var(--error)]/20 text-[var(--error)]',
};

const ORDER_FLOW = ['PENDIENTE', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO'];

export default function PedidoClienteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getById(id)
      .then(setOrder)
      .catch(() => { toast.error('Error al cargar pedido'); navigate('/mis-pedidos'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen bg-surface-secondary pt-20 flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  if (!order) return null;

  const currentStep = ORDER_FLOW.indexOf(order.estado);
  const isCancelled = order.estado === 'CANCELADO';

  return (
    <div className="min-h-screen bg-surface-secondary pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <Link to="/mis-pedidos" className="hover:text-ink">Mis pedidos</Link>
          <ChevronRight size={12} />
          <span className="text-ink">Pedido #{order.id}</span>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-[800] text-ink">Pedido #{order.id}</h1>
            <p className="text-sm text-ink-tertiary mt-1">{formatFecha(order.fechaPedido)}</p>
          </div>
          <span className={`badge text-sm px-4 py-1.5 ${STATUS_STYLES[order.estado] || ''}`}>{order.estado}</span>
        </div>

        {/* Status Stepper */}
        <div className="bg-surface rounded-lg border border-border p-8 mb-6">
          {isCancelled ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--error)]/20 flex items-center justify-center"><Package size={24} className="text-[var(--error)]" /></div>
              <p className="text-lg font-bold text-[var(--error)]">Pedido cancelado</p>
              <p className="text-sm text-ink-tertiary mt-1">Este pedido fue cancelado.</p>
            </div>
          ) : (
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {ORDER_FLOW.map((state, i) => {
                const isActive = i <= currentStep;
                const isLast = i === ORDER_FLOW.length - 1;
                return (
                  <div key={state} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isActive ? 'bg-accent-500 text-surface' : 'bg-white/[0.06] text-ink-tertiary'}`}>
                        {isActive && i < currentStep ? <Check size={18} /> : i + 1}
                      </div>
                      <p className={`text-[11px] mt-2 font-medium ${isActive ? 'text-accent-500' : 'text-ink-tertiary'}`}>{state}</p>
                    </div>
                    {!isLast && <div className={`flex-1 h-0.5 mx-2 ${i < currentStep ? 'bg-accent-500' : 'bg-white/[0.06]'}`} />}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 bg-surface rounded-lg border border-border p-6">
            <h2 className="text-sm font-bold text-ink mb-4">Productos</h2>
            <div className="space-y-4">
              {order.detalles?.map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-16 h-20 rounded overflow-hidden bg-surface-tertiary shrink-0">
                    <img src={d.imagenPrincipal || ''} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">{d.productoNombre}</p>
                    <p className="text-xs text-ink-tertiary">Cant: {d.cantidad} × {formatPrecio(d.precioUnitario)}</p>
                  </div>
                  <p className="text-sm text-accent-500 font-bold">{formatPrecio(d.subtotal)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="bg-surface rounded-lg border border-border p-6">
              <h2 className="text-sm font-bold text-ink mb-4">Resumen</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-secondary">Subtotal</span><span>{formatPrecio(order.subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Envío</span><span className={order.costoEnvio > 0 ? '' : 'text-[var(--success)]'}>{order.costoEnvio > 0 ? formatPrecio(order.costoEnvio) : 'Gratis'}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-base"><span className="text-ink">Total</span><span className="text-accent-500">{formatPrecio(order.total)}</span></div>
              </div>
            </div>

            {order.direccion && (
              <div className="bg-surface rounded-lg border border-border p-6">
                <h2 className="text-sm font-bold text-ink mb-3 flex items-center gap-2"><MapPin size={14} className="text-accent-500" /> Envío</h2>
                <p className="text-sm text-ink-secondary">{order.direccion.calle} #{order.direccion.numero}</p>
                <p className="text-sm text-ink-secondary">{order.direccion.ciudad}, {order.direccion.departamento}</p>
              </div>
            )}

            {order.historialEstados?.length > 0 && (
              <div className="bg-surface rounded-lg border border-border p-6">
                <h2 className="text-sm font-bold text-ink mb-3">Actualizaciones</h2>
                <div className="space-y-3">
                  {order.historialEstados.map((h, i) => (
                    <div key={i} className="flex gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full mt-1 ${STATUS_STYLES[h.estado]?.split(' ')[0] || 'bg-white/[0.06]'}`} />
                      <div>
                        <p className="text-ink font-medium">{h.estado}</p>
                        {h.comentario && <p className="text-ink-tertiary">{h.comentario}</p>}
                        <p className="text-ink-tertiary">{formatFecha(h.fecha)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
