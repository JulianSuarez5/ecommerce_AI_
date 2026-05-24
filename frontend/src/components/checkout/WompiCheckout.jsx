import { useState, useEffect, useRef, useCallback } from 'react';
import { wompiService } from '../../services/wompiService';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const SCRIPT_ID = 'wompi-sdk';
const SCRIPT_SRC = 'https://checkout.wompi.co/widget.js';

export default function WompiCheckout({ addressId }) {
  const navigate = useNavigate();
  const { clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);
  const widgetRef = useRef(null);

  useEffect(() => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.id = SCRIPT_ID;
    script.async = true;
    script.onload = () => setScriptReady(true);
    document.body.appendChild(script);
    return () => {
      const el = document.getElementById(SCRIPT_ID);
      if (el) el.remove();
    };
  }, []);

  const { items } = useCart();

  const handlePayWithWompi = useCallback(async () => {
    if (!addressId) {
      toast.error('Selecciona una dirección de envío');
      return;
    }
    if (!scriptReady) {
      toast.error('Cargando plataforma de pago...');
      return;
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        productoId: item.id,
        cantidad: item.qty,
      }));
      const wompiData = await wompiService.iniciarPago(addressId, orderItems);

      const checkout = new window.WidgetCheckout({
        currency: wompiData.currency,
        amountInCents: wompiData.amountInCents,
        reference: wompiData.reference,
        publicKey: wompiData.publicKey,
        signature: {
          integrity: wompiData.integritySignature,
        },
      });

      widgetRef.current = checkout;

      checkout.open(async (result) => {
        try {
          const confirmResp = await wompiService.confirmarPago(
            wompiData.reference,
            result.transaction.id,
            wompiData.orderId
          );

          clear();
          toast.success('¡Pago exitoso!');
          navigate(`/pedido-confirmado/${confirmResp.orderId}`, { replace: true });
        } catch (err) {
          toast.error(err.message || 'Error al confirmar el pago');
          setLoading(false);
        }
      });
    } catch (err) {
      toast.error(err.message || 'Error al iniciar el pago');
    }
    setLoading(false);
  }, [addressId, scriptReady, navigate, clear]);

  return (
    <div>
      <button
        onClick={handlePayWithWompi}
        disabled={loading || !scriptReady || !addressId}
        className="w-full py-4 px-6 mt-6 border-none rounded-xl cursor-pointer text-base font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Procesando...
          </>
        ) : scriptReady ? (
          <>
            <Banknote size={20} />
            Pagar con Bancolombia / PSE / Nequi
          </>
        ) : (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Cargando Wompi...
          </>
        )}
      </button>
    </div>
  );
}
