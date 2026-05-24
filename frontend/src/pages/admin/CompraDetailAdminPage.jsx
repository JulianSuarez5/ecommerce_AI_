import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { purchaseService } from '../../services/purchaseService';
import { formatPrecio, formatFecha } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const STATUS_FLOW = [
  { key: 'PENDIENTE', label: 'Pendiente', icon: Clock, desc: 'Orden creada, esperando confirmación' },
  { key: 'CONFIRMADO', label: 'Confirmado', icon: Package, desc: 'Orden confirmada con el proveedor' },
  { key: 'ENVIADO', label: 'Enviado', icon: Truck, desc: 'Productos enviados por el proveedor' },
  { key: 'RECIBIDO', label: 'Recibido', icon: CheckCircle, desc: 'Productos recibidos en almacén' },
];

const STATUS_META = {
  PENDIENTE: { color: 'text-accent-500', bg: 'bg-accent-500/20' },
  CONFIRMADO: { color: 'text-info', bg: 'bg-info/20' },
  ENVIADO: { color: 'text-accent-500', bg: 'bg-accent-500/20' },
  RECIBIDO: { color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/20' },
  CANCELADO: { color: 'text-[var(--error)]', bg: 'bg-[var(--error)]/20' },
};

function getNextStates(current) {
  switch (current) {
    case 'PENDIENTE': return ['CONFIRMADO', 'CANCELADO'];
    case 'CONFIRMADO': return ['ENVIADO', 'CANCELADO'];
    case 'ENVIADO': return ['RECIBIDO', 'CANCELADO'];
    default: return [];
  }
}

function getStateIndex(key) {
  return STATUS_FLOW.findIndex((s) => s.key === key);
}

export default function CompraDetailAdminPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comentario, setComentario] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    purchaseService.getById(id).then((d) => setOrder(d)).catch(() => { toast.error('Error al cargar'); navigate('/admin/compras'); }).finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (nuevoEstado) => {
    if (!window.confirm(`¿Cambiar estado a "${nuevoEstado}"?`)) return;
    setUpdating(true);
    try {
      const d = await purchaseService.updateStatus(id, { estado: nuevoEstado, comentario });
      setOrder(d);
      setComentario('');
      toast.success('Estado actualizado');
    } catch (err) { toast.error(err.message || 'Error'); }
    setUpdating(false);
  };

  if (loading) return <LoadingSpinner className="py-20" />;
  if (!order) return <div className="text-center py-20" style={{ color: 'var(--text-tertiary)' }}>Orden no encontrada</div>;

  const currentIndex = getStateIndex(order.estado);
  const isCancelled = order.estado === 'CANCELADO';
  const nextStates = getNextStates(order.estado);

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/admin/compras')} className="flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-tertiary)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}>
        <ArrowLeft size={16} /> Volver a órdenes de compra
      </button>

      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Orden de compra #{order.id}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{order.supplierNombre} | {formatFecha(order.fechaCreacion)}</p>
        </div>
        <span className={`badge text-sm ${STATUS_META[order.estado]?.bg || 'bg-white/[0.06]'} ${STATUS_META[order.estado]?.color || ''}`} style={{ color: STATUS_META[order.estado]?.color ? undefined : 'var(--text-secondary)' }}>
          {order.estado}
        </span>
      </div>

      {/* Status Stepper */}
      <div className="bg-surface rounded-lg border border-border p-6">
        {isCancelled ? (
          <div className="flex items-center gap-3" style={{ color: 'var(--error)' }}>
            <XCircle size={24} />
            <div>
              <p className="font-semibold">Orden cancelada</p>
              <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>El proceso se detuvo</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            {STATUS_FLOW.map((step, idx) => {
              const Icon = step.icon;
              const done = idx <= currentIndex;
              const current = idx === currentIndex;
              return (
                <div key={step.key} className="flex flex-col items-center text-center flex-1 relative">
                  {idx > 0 && (
                    <div className={`absolute top-4 right-1/2 w-full h-[2px] -z-10`} style={{ background: done ? 'var(--accent)' : 'var(--border-color)' }} />
                  )}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: done ? 'var(--accent)' : 'var(--bg-secondary)', color: done ? 'var(--bg-surface)' : 'var(--text-tertiary)', ...(current ? { ring: '2px solid var(--accent)', ringOffset: '2px' } : {}) }}>
                    <Icon size={16} />
                  </div>
                  <p className="text-xs font-semibold mt-2" style={{ color: done ? 'var(--accent)' : 'var(--text-tertiary)' }}>{step.label}</p>
                  <p className="text-[10px] mt-0.5 max-w-[100px]" style={{ color: 'var(--text-tertiary)' }}>{step.desc}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Status actions */}
        {nextStates.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Cambiar estado</p>
            <div className="flex items-center gap-3">
              {nextStates.map((st) => (
                <button key={st} onClick={() => handleStatusChange(st)} disabled={updating}
                  className="px-4 py-2 rounded-lg text-sm font-medium border transition-all flex items-center gap-2"
                  style={{
                    borderColor: st === 'CANCELADO' ? 'var(--error)' : 'var(--accent)',
                    color: st === 'CANCELADO' ? 'var(--error)' : 'var(--accent)',
                    background: st === 'CANCELADO' ? 'var(--error)' : 'var(--accent)',
                    opacity: 0.1,
                  }}>
                  {st === 'CANCELADO' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  {st === 'CANCELADO' ? 'Cancelar orden' : `Marcar como ${st}`}
                </button>
              ))}
              <input value={comentario} onChange={(e) => setComentario(e.target.value)} className="input flex-1 text-sm" placeholder="Comentario (opcional)" />
            </div>
          </div>
        )}
      </div>

      {/* Products */}
      <div className="bg-surface rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Productos</h2>
        </div>
        <div className="divide-y divide-border">
          {order.items?.map((item) => (
            <div key={item.id} className="px-6 py-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded bg-surface-tertiary overflow-hidden shrink-0">
                {item.productImagen ? (
                  <img src={item.productImagen} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-tertiary)' }}><Package size={18} /></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.productNombre}</p>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>SKU: {item.productSku}</p>
              </div>
              <div className="text-right">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.cantidad} × {formatPrecio(item.costoUnitario)}</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>{formatPrecio(item.subtotal)}</p>
              </div>
            </div>
          ))}
          <div className="px-6 py-4 flex justify-end border-t border-border bg-surface-tertiary/50">
            <div className="text-right">
              <p className="text-xs uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Total</p>
              <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{formatPrecio(order.total)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status history */}
      <div className="bg-surface rounded-lg border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Historial de estados</h2>
        </div>
        <div className="divide-y divide-border">
          {order.historial?.length === 0 ? (
            <div className="px-6 py-4 text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin historial</div>
          ) : (
            order.historial?.map((h, idx) => (
              <div key={idx} className="px-6 py-3 flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5`} style={{ background: STATUS_META[h.estado]?.bg || 'var(--border-color)' }} />
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{h.estado}</p>
                  {h.comentario && <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{h.comentario}</p>}
                  <p className="text-[11px] mt-1" style={{ color: 'var(--text-tertiary)' }}>
                    {h.usuario && <>por {h.usuario} | </>}
                    {h.fecha ? new Date(h.fecha).toLocaleString() : ''}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
