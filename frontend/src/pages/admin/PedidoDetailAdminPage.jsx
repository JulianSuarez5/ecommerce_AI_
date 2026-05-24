import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Package, MapPin, Phone, Mail, User } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { formatPrecio, formatFecha } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
  PENDIENTE: 'bg-accent-500/20 text-accent-500',
  CONFIRMADO: 'bg-blue-500/20 text-blue-400',
  ENVIADO: 'bg-purple-500/20 text-purple-400',
  ENTREGADO: 'bg-[var(--success)]/20 text-[var(--success)]',
  CANCELADO: 'bg-[var(--error)]/20 text-[var(--error)]',
};

const STATE_TRANSITIONS = {
  PENDIENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['ENVIADO', 'CANCELADO'],
  ENVIADO: ['ENTREGADO'],
  ENTREGADO: [],
  CANCELADO: [],
};

export default function PedidoDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    orderService.getById(id)
      .then(setOrder)
      .catch(() => { toast.error('Error al cargar pedido'); navigate('/admin/pedidos'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleStatusChange = async (nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a ${nuevoEstado}?`)) return;
    setStatusLoading(true);
    try {
      const params = { estado: nuevoEstado };
      if (comment.trim()) params.comentario = comment;
      const updated = await orderService.adminUpdateStatus(id, params);
      setOrder(updated);
      setComment('');
      toast.success(`Estado cambiado a ${nuevoEstado}`);
    } catch (err) {
      toast.error(err.message || 'Error al cambiar estado');
    }
    setStatusLoading(false);
  };

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;
  if (!order) return null;

  const nextStates = STATE_TRANSITIONS[order.estado] || [];

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/admin/pedidos')} className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
        <ArrowLeft size={16} /> Volver a pedidos
      </button>

      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Pedido #{order.id}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{formatFecha(order.fechaPedido)}</p>
        </div>
        <span className={`badge text-sm px-4 py-1.5 ${STATUS_STYLES[order.estado] || ''}`}>{order.estado}</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cliente info */}
        <div className="bg-surface rounded-lg border border-border p-6">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><User size={16} style={{ color: 'var(--accent)' }} /> Cliente</h2>
          <div className="space-y-3 text-sm">
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.userNombre}</p>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Mail size={14} /> {order.userEmail}</div>
            <div className="flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Phone size={14} /> {order.userTelefono || '—'}</div>
          </div>
        </div>

        {/* Dirección */}
        {order.direccion && (
          <div className="bg-surface rounded-lg border border-border p-6">
            <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><MapPin size={16} style={{ color: 'var(--accent)' }} /> Dirección de envío</h2>
            <div className="space-y-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{order.direccion.alias}</p>
              <p>{order.direccion.calle} #{order.direccion.numero}</p>
              <p>{order.direccion.ciudad}, {order.direccion.departamento}</p>
              {order.direccion.referencia && <p style={{ color: 'var(--text-tertiary)' }}>{order.direccion.referencia}</p>}
            </div>
          </div>
        )}

        {/* Payment */}
        <div className="bg-surface rounded-lg border border-border p-6">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Package size={16} style={{ color: 'var(--accent)' }} /> Pago</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Método</span><span style={{ color: 'var(--text-primary)' }}>{order.metodoPago || '—'}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--text-secondary)' }}>Estado</span><span className="font-medium" style={{ color: order.estadoPago === 'APROBADO' ? 'var(--success)' : 'var(--text-primary)' }}>{order.estadoPago || '—'}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span style={{ color: 'var(--text-primary)' }}>Total</span><span style={{ color: 'var(--accent)' }}>{formatPrecio(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="bg-surface rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Productos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Producto', 'Cantidad', 'Precio', 'Subtotal'].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {order.detalles?.map((d, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-surface-tertiary overflow-hidden shrink-0">
                        <img src={d.imagenPrincipal || ''} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                      </div>
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{d.productoNombre}</span>
                    </div>
                  </td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-secondary)' }}>{d.cantidad}</td>
                  <td className="px-6 py-3" style={{ color: 'var(--text-primary)' }}>{formatPrecio(d.precioUnitario)}</td>
                  <td className="px-6 py-3 font-semibold" style={{ color: 'var(--accent)' }}>{formatPrecio(d.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-surface rounded-lg border border-border p-6">
        <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Historial de estados</h2>
        {order.historialEstados?.length > 0 ? (
          <div className="space-y-4">
            {order.historialEstados.map((h, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: STATUS_STYLES[h.estado]?.split(' ')[0].replace('bg-', 'var(--').replace('/', ')').replace('20', '/0.2)') || 'var(--bg-secondary)' }} />
                  {i < order.historialEstados.length - 1 && <div className="w-px flex-1" style={{ background: 'var(--border-color)' }} />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{h.estado}</p>
                  {h.comentario && <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{h.comentario}</p>}
                  <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{formatFecha(h.fecha)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin historial disponible</p>
        )}
      </div>

      {/* Cambiar estado */}
      {nextStates.length > 0 && (
        <div className="bg-surface rounded-lg border border-border p-6">
          <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Cambiar estado</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input value={comment} onChange={(e) => setComment(e.target.value)} type="text" placeholder="Comentario (opcional)" className="input flex-1 text-sm" />
            <div className="flex gap-2">
              {nextStates.map((state) => (
                <button key={state} onClick={() => handleStatusChange(state)} className={`btn btn-primary text-sm px-5 ${state === 'CANCELADO' ? '!bg-[var(--error)] !text-white' : ''}`} disabled={statusLoading}>
                  {statusLoading ? '...' : state === 'CONFIRMADO' ? 'Confirmar' : state === 'ENVIADO' ? 'Enviar' : state === 'ENTREGADO' ? 'Entregar' : state === 'CANCELADO' ? 'Cancelar' : state}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
