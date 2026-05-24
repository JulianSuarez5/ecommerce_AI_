import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Package, ShoppingBag, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { orderService } from '../services/orderService';
import { formatPrecio } from '../utils/format';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ROBOT_IMG = 'https://cdn.prod.website-files.com/6501f1891917bde75ab542ee/653e8be9ae6bc59344b62ff3_robot-phunk%201.webp';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    orderService.getById(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}><LoadingSpinner size="lg" /></div>;

  return (
    <div className="min-h-screen pt-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary mb-8">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <span className="text-ink">Pedido confirmado</span>
        </div>

        <div className="rounded-lg border border-border p-8 text-center" style={{ background: 'var(--bg-surface)' }}>
          {/* Bender celebration */}
          <motion.div
            className="inline-block mb-4"
            animate={{ rotate: [0, -5, 5, -5, 5, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          >
            <img src={ROBOT_IMG} alt="Bender" className="w-24 h-24 object-contain" />
          </motion.div>

          {/* Speech bubble */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 20 }}
            className="inline-block mb-6"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            <p style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600 }}>
              ¡Pedido confirmado! Gracias por confiar en Centrova 🎉
            </p>
          </motion.div>

          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
            <Check size={40} className="text-[var(--success)]" />
          </div>

          <h1 className="text-3xl font-[900] text-ink mb-2">¡Pedido confirmado!</h1>
          {order ? (
            <>
              <p className="text-accent-500 font-bold text-lg mb-2">Pedido #{order.id}</p>
              <p className="text-sm text-ink-secondary mb-8">
                Hemos recibido tu pedido y estamos procesándolo.
                Recibirás un correo con los detalles de tu compra.
              </p>

              <div className="rounded-lg p-6 mb-8 text-left" style={{ background: 'var(--bg-secondary)' }}>
                <h3 className="text-sm font-bold text-ink mb-4">Resumen del pedido</h3>
                <div className="space-y-3 mb-4">
                  {order.detalles?.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-ink-secondary">{d.productoNombre} <span className="text-ink-tertiary">x{d.cantidad}</span></span>
                      <span className="text-ink">{formatPrecio(d.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-ink-secondary">Subtotal</span><span>{formatPrecio(order.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-ink-secondary">Envío</span><span>{order.costoEnvio > 0 ? formatPrecio(order.costoEnvio) : <span className="text-[var(--success)]">Gratis</span>}</span></div>
                  <div className="flex justify-between font-bold text-base"><span className="text-ink">Total</span><span className="text-accent-500">{formatPrecio(order.total)}</span></div>
                </div>
              </div>

              {order.direccion && (
                <div className="rounded-lg p-6 mb-8 text-left" style={{ background: 'var(--bg-secondary)' }}>
                  <h3 className="text-sm font-bold text-ink mb-3">Dirección de envío</h3>
                  <p className="text-sm text-ink-secondary">{order.direccion.calle} #{order.direccion.numero}</p>
                  <p className="text-sm text-ink-secondary">{order.direccion.ciudad}, {order.direccion.departamento}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-tertiary mb-8">
              Gracias por tu compra. Pronto recibirás la confirmación.
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/mis-pedidos" className="btn-primary flex items-center justify-center gap-2">
              <Package size={16} /> Ver mis pedidos
            </Link>
            <Link to="/catalogo" className="btn-outline flex items-center justify-center gap-2">
              <ShoppingBag size={16} /> Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
