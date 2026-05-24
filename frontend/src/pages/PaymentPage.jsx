import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ChevronRight, Lock } from 'lucide-react';
import { paymentService } from '../services/paymentService';
import { useCart } from '../context/CartContext';
import { formatPrecio } from '../utils/format';
import toast from 'react-hot-toast';

const FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80';
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sandbox';

const initialPayPalOptions = {
  'client-id': PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clear } = useCart();
  const [processing, setProcessing] = useState(false);

  const addressId = location.state?.addressId;
  const shipping = total >= 100000 ? 0 : 15000;

  if (!addressId || items.length === 0) {
    navigate('/carrito', { replace: true });
    return null;
  }

  const handlePayPalApprove = async (data) => {
    setProcessing(true);
    try {
      const orderItems = items.map((item) => ({
        productoId: item.id,
        cantidad: item.qty,
      }));

      const result = await paymentService.processPayPal({
        addressId,
        metodoPago: 'PAYPAL',
        paypalOrderId: data.orderID,
        items: orderItems,
      });

      clear();
      navigate(`/pedido-confirmado/${result.id}`, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pago');
    }
    setProcessing(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary pt-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-xs text-ink-tertiary mb-6">
          <Link to="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={12} />
          <Link to="/carrito" className="hover:text-ink">Carrito</Link>
          <ChevronRight size={12} />
          <Link to="/checkout" className="hover:text-ink">Checkout</Link>
          <ChevronRight size={12} />
          <span className="text-ink">Pago</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-surface rounded-lg border border-border p-6">
              <div className="flex items-center gap-2 mb-6">
                <Lock size={18} className="text-accent-500" />
                <h2 className="text-lg font-bold text-ink">Pago seguro</h2>
              </div>
              <p className="text-sm text-ink-secondary mb-6">
                Tu pago será procesado de forma segura a través de PayPal.
                Puedes pagar con tu cuenta de PayPal o con tarjeta de crédito/débito.
              </p>

              <PayPalScriptProvider options={initialPayPalOptions}>
                <PayPalButtons
                  style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' }}
                  createOrder={(data, actions) => {
                    const itemTotal = (total / 4000).toFixed(2);
                    return actions.order.create({
                      purchase_units: [{
                        amount: { value: itemTotal },
                        description: 'Compra en CENTROVA',
                      }],
                    });
                  }}
                  onApprove={handlePayPalApprove}
                  onError={() => toast.error('Error al procesar el pago con PayPal')}
                  onCancel={() => toast.error('Pago cancelado')}
                />
              </PayPalScriptProvider>

              {processing && (
                <div className="text-center mt-4">
                  <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-ink-tertiary mt-2">Procesando tu pedido...</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg border border-border p-6 sticky top-24">
              <h3 className="text-sm font-bold text-ink mb-4">Resumen del pedido</h3>
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.key} className="flex gap-3">
                    <div className="w-12 h-14 rounded overflow-hidden bg-surface-tertiary shrink-0">
                      <img src={item.img || FALLBACK} alt={item.nombre} className="w-full h-full object-cover" onError={(e) => { e.target.src = FALLBACK; }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-ink truncate">{item.nombre}</p>
                      <p className="text-[11px] text-ink-tertiary">x{item.qty}</p>
                    </div>
                    <p className="text-xs text-accent-500 font-bold">{formatPrecio(item.precio * item.qty)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-ink-secondary">Subtotal</span><span>{formatPrecio(total)}</span></div>
                <div className="flex justify-between"><span className="text-ink-secondary">Envío</span><span className={shipping === 0 ? 'text-[var(--success)]' : ''}>{shipping === 0 ? 'Gratis' : formatPrecio(shipping)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold"><span className="text-ink">Total</span><span className="text-accent-500 text-lg">{formatPrecio(total + shipping)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
