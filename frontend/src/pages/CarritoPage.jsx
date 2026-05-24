import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrecio } from '../utils/format';
import QuantitySelector from '../components/ui/QuantitySelector';
import { useState } from 'react';
import { motion, AnimatePresence, spring, smoothIn, staggerContainer, staggerItem, slideUp, pageTransition, cardTap } from '../utils/motion';

const FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';
const ROBOT_IMG = 'https://cdn.prod.website-files.com/6501f1891917bde75ab542ee/653e8be9ae6bc59344b62ff3_robot-phunk%201.webp';

export default function CarritoPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, total } = useCart();
  const [promo, setPromo] = useState('');
  const shipping = total >= 100000 ? 0 : 15000;

  const imgErr = (e) => { e.target.src = FALLBACK; };

  if (items.length === 0) {
    return (
      <motion.div
        className="min-h-screen pt-20 flex items-center justify-center"
        style={{ background: 'var(--bg-secondary, #F8F9FB)' }}
        variants={pageTransition}
        initial="initial"
        animate="animate"
      >
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothIn, delay: 0.1 }}
        >
          {/* Robot Bender */}
          <div className="relative inline-block mb-6">
            <motion.img
              src={ROBOT_IMG}
              alt="Bender"
              className="w-32 h-32 object-contain"
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Speech bubble */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '260px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-color)',
                borderRadius: '14px',
                padding: '14px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: '12px',
                  height: '12px',
                  background: 'var(--bg-surface)',
                  borderRight: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                }}
              />
              <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Tu carrito está vacío... pero tengo ideas para ti 🛒
              </p>
              <motion.button
                onClick={() => navigate('/catalogo')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'var(--accent)',
                  color: 'var(--accent-text)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 600,
                }}
              >
                Ver recomendaciones →
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const shippingProgress = Math.min((total / 100000) * 100, 100);

  return (
    <motion.div
      className="min-h-screen pt-20"
      style={{ background: 'var(--bg-secondary, #F8F9FB)' }}
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div className="flex items-center gap-2 mb-6 text-sm" variants={slideUp}>
          <Link to="/" className="text-ink-secondary no-underline">Inicio</Link>
          <ChevronRight size={12} className="text-ink-tertiary" />
          <span className="text-ink font-medium">Carrito</span>
        </motion.div>

        <motion.h1 className="text-3xl font-extrabold text-ink mb-8" variants={slideUp}>
          Tu carrito{' '}
          <span className="text-ink-secondary text-lg font-normal">
            ({items.length} producto{items.length !== 1 ? 's' : ''})
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, x: -30, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 30, scale: 0.95 }}
                  transition={{ ...spring, stiffness: 250, damping: 25 }}
                  className="card rounded-xl flex gap-4 p-4"
                >
                  <motion.div
                    className="w-[100px] h-[130px] rounded-lg overflow-hidden shrink-0"
                    style={{ background: 'var(--bg-secondary)' }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <img
                      src={item.img || FALLBACK}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                      onError={imgErr}
                    />
                  </motion.div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="truncate text-sm font-bold text-ink m-0">
                          {item.nombre}
                        </h3>
                        {item.color && item.color !== 'default' && (
                          <p className="text-xs text-ink-secondary mt-1">
                            Color: {item.color}
                          </p>
                        )}
                        {item.sku && (
                          <p className="text-xs text-ink-secondary mt-0.5">
                            SKU: {item.sku}
                          </p>
                        )}
                      </div>
                      <motion.button
                        onClick={() => removeItem(item.key)}
                        className="btn-icon btn-icon-sm text-ink-tertiary hover:text-red-500 hover:bg-red-50"
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <QuantitySelector value={item.qty} onChange={(q) => updateQty(item.key, q)} max={item.stock && item.stock > 0 ? item.stock : 99} />
                      <motion.span
                        className="text-accent-500 font-extrabold text-base"
                        key={`${item.key}-${item.qty}`}
                        initial={{ scale: 1.2, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={spring}
                      >
                        {formatPrecio(item.precio * item.qty)}
                      </motion.span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="lg:col-span-2">
            <motion.div
              className="card rounded-xl p-6 sticky top-24"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...smoothIn, delay: 0.2 }}
            >
              <h2 className="text-lg font-bold text-ink mb-4">
                Resumen del pedido
              </h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Subtotal</span>
                  <motion.span
                    className="text-ink font-semibold"
                    key={total}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={spring}
                  >
                    {formatPrecio(total)}
                  </motion.span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Envío</span>
                  <motion.span
                    className={`font-semibold ${shipping === 0 ? 'text-green-600' : 'text-ink'}`}
                    key={shipping}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {shipping === 0 ? 'Gratis' : formatPrecio(shipping)}
                  </motion.span>
                </div>
                {total > 0 && total < 100000 && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary, var(--bg-secondary))' }}>
                      <motion.div
                        className="h-full bg-accent-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${shippingProgress}%` }}
                        transition={{ ...spring, stiffness: 100 }}
                      />
                    </div>
                    <p className="text-xs text-ink-secondary m-0">
                      Faltan {formatPrecio(100000 - total)} para envío gratis
                    </p>
                  </motion.div>
                )}
                <hr className="border-0 border-t border-solid border-border my-1" />
                <div className="flex justify-between">
                  <span className="text-ink font-bold">Total</span>
                  <motion.span
                    className="text-accent-500 text-2xl font-extrabold"
                    key={total + shipping}
                    initial={{ scale: 1.15, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={spring}
                  >
                    {formatPrecio(total + shipping)}
                  </motion.span>
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <input
                  value={promo}
                  onChange={(e) => setPromo(e.target.value)}
                  type="text"
                  placeholder="Código promocional"
                  className="input flex-1"
                />
                <motion.button className="btn btn-outline" whileTap={cardTap}>
                  Aplicar
                </motion.button>
              </div>

              <motion.button
                onClick={() => navigate('/checkout')}
                className="btn btn-primary btn-lg w-full mt-6 font-bold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Proceder al pago <ArrowRight size={16} />
              </motion.button>

              <Link
                to="/catalogo"
                className="block text-center mt-4 text-sm text-ink-secondary no-underline hover:text-accent-500"
              >
                ← Continuar comprando
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
