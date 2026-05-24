import { ShoppingBag, X, ArrowRight, Trash2, Gift } from 'lucide-react';
import { motion, AnimatePresence, spring } from '../../utils/motion';
import { useCart } from '../../context/CartContext';
import { formatPrecio } from '../../utils/format';
import QuantitySelector from './QuantitySelector';
import { useNavigate } from 'react-router-dom';

const FREE_SHIPPING_THRESHOLD = 100000;
const SHIPPING_COST = 15000;

function itemVariants() {
  return {
    hidden: { opacity: 0, x: 80, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { ...spring, stiffness: 280, damping: 26 } },
    exit: { opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2, ease: 'easeInOut' } },
  };
}

function CartItem({ item, onRemove, onUpdateQty }) {
  const { img, nombre, color, sku, qty, precio, key } = item;

  return (
    <motion.div
      layout
      variants={itemVariants()}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex gap-3 p-3 rounded-xl bg-surface-tertiary/40 dark:bg-surface-tertiary/10 group"
    >
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-tertiary dark:bg-surface-tertiary/30 shrink-0">
        <img
          src={img || '/placeholder.svg'}
          alt={nombre}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-ink dark:text-ink-dark truncate">{nombre}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          {color && (
            <span className="text-xs text-ink-secondary dark:text-ink-dark-secondary capitalize">{color}</span>
          )}
          {sku && (
            <span className="text-xs text-ink-tertiary dark:text-ink-dark-tertiary">SKU: {sku}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-2">
          <QuantitySelector
            value={qty}
            onChange={(val) => onUpdateQty(key, val)}
            min={1}
            max={item.stock && item.stock > 0 ? item.stock : 99}
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink dark:text-ink-dark whitespace-nowrap">
              {formatPrecio(precio * qty)}
            </span>
            <button
              onClick={() => onRemove(key)}
              className="p-1.5 rounded-lg text-ink-secondary dark:text-ink-dark-secondary hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Eliminar ${nombre}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ShippingProgress({ total }) {
  const progress = Math.min(total / FREE_SHIPPING_THRESHOLD, 1);
  const remaining = FREE_SHIPPING_THRESHOLD - total;
  const isFree = total >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Gift size={16} className={isFree ? 'text-accent-500' : 'text-ink-secondary dark:text-ink-dark-secondary'} />
        {isFree ? (
          <span className="text-sm font-semibold text-accent-500">¡Envío gratis!</span>
        ) : (
          <span className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
            ¡Estás a <span className="font-semibold text-ink dark:text-ink-dark">{formatPrecio(remaining)}</span> de obtener envío gratis!
          </span>
        )}
      </div>
      <div className="h-2 rounded-full bg-surface-tertiary dark:bg-surface-tertiary/30 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1 }}
        />
      </div>
    </div>
  );
}

export default function SlideCart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, total, totalItems } = useCart();
  const shipping = total >= FREE_SHIPPING_THRESHOLD || total === 0 ? 0 : SHIPPING_COST;
  const grandTotal = total + shipping;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          <motion.aside
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md flex flex-col"
            style={{ background: '#0f2027', borderLeft: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.95 }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border dark:border-border-dark shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-ink dark:text-ink-dark" />
                <h2 className="text-base font-bold text-ink dark:text-ink-dark">
                  Carrito {totalItems > 0 && <span className="font-normal text-ink-secondary dark:text-ink-dark-secondary">({totalItems})</span>}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-ink-secondary dark:text-ink-dark-secondary hover:text-ink dark:hover:text-ink-dark hover:bg-surface-tertiary dark:hover:bg-surface-tertiary/30 transition-colors"
                aria-label="Cerrar carrito"
              >
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="mb-5 p-4 bg-surface-tertiary dark:bg-surface-tertiary/20 rounded-2xl text-ink-secondary dark:text-ink-dark-secondary">
                  <ShoppingBag size={48} />
                </div>
                <h3 className="text-lg font-bold text-ink dark:text-ink-dark mb-1">Tu carrito está vacío</h3>
                <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-6 max-w-xs">
                  Agrega productos para empezar a comprar
                </p>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-ink text-surface dark:bg-surface dark:text-ink rounded-lg text-sm font-semibold hover:opacity-90 transition-all active:scale-95"
                >
                  Seguir comprando
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                  <AnimatePresence mode="popLayout">
                    {items.map((item) => (
                      <CartItem
                        key={item.key}
                        item={item}
                        onRemove={removeItem}
                        onUpdateQty={updateQty}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                <div className="shrink-0 border-t border-border dark:border-border-dark bg-surface dark:bg-surface-dark px-5 py-4 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
                  <ShippingProgress total={total} />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-secondary dark:text-ink-dark-secondary">Subtotal</span>
                      <span className="font-semibold text-ink dark:text-ink-dark">{formatPrecio(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary dark:text-ink-dark-secondary">Envío</span>
                      <span className={shipping === 0 ? 'font-semibold text-accent-500' : 'font-semibold text-ink dark:text-ink-dark'}>
                        {shipping === 0 ? 'Gratis' : formatPrecio(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-border dark:border-border-dark pt-2">
                      <span className="text-base font-bold text-ink dark:text-ink-dark">Total</span>
                      <span className="text-base font-bold text-ink dark:text-ink-dark">{formatPrecio(grandTotal)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-ink text-surface dark:bg-surface dark:text-ink rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-[0.97]"
                  >
                    Ir a pagar
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
