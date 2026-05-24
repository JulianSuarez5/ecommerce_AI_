import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, Wallet, Banknote, MapPin, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrecio } from '../utils/format';
import { sanitizeInput } from '../utils/sanitize';
import { useState, useEffect } from 'react';
import { addressService } from '../services/addressService';
import { orderService } from '../services/orderService';
import WompiCheckout from '../components/checkout/WompiCheckout';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, spring, smoothIn, slideUp, pageTransition } from '../utils/motion';

const FALLBACK = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80';

const initialForm = { nombre: '', direccion: '', ciudad: '', departamento: '', codigoPostal: '', telefono: '' };

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clear } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [metodo, setMetodo] = useState('tarjeta');
  const [direcciones, setDirecciones] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true });
    else if (items.length === 0) navigate('/carrito', { replace: true });
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      addressService.getAll()
        .then((data) => {
          const dirs = Array.isArray(data) ? data : [];
          setDirecciones(dirs);
          const principal = dirs.find(d => d.esPrincipal);
          if (principal) setSelectedAddressId(principal.id);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const shipping = total >= 100000 ? 0 : 15000;

  const setField = (field) => (e) => setForm((p) => ({ ...p, [field]: sanitizeInput(e.target.value) }));

  const handleNewAddress = async () => {
    const missing = Object.entries(form).filter(([, v]) => !v.trim());
    if (missing.length > 0) {
      toast.error('Completa todos los campos de envío');
      return;
    }
    try {
      const addrResp = await addressService.create({
        alias: 'Mi dirección',
        calle: form.direccion,
        numero: '',
        ciudad: form.ciudad,
        departamento: form.departamento,
        codigoPostal: form.codigoPostal,
        referencia: '',
        esPrincipal: direcciones.length === 0,
      });
      const newAddr = addrResp;
      setDirecciones(prev => [...prev, newAddr]);
      setSelectedAddressId(newAddr.id);
      setShowNewAddress(false);
      setForm(initialForm);
      toast.success('Dirección guardada');
    } catch (err) {
      toast.error('Error al guardar la dirección');
    }
  };

  const handleConfirm = async () => {
    if (!selectedAddressId) {
      toast.error('Selecciona o agrega una dirección de envío');
      return;
    }
    
    if (metodo === 'paypal') {
      navigate('/pago', { state: { addressId: selectedAddressId } });
      return;
    }
    
    setLoading(true);
    try {
      const orderResp = await orderService.create({
        addressId: selectedAddressId,
        metodoPago: metodo.toUpperCase(),
      });
      const orderId = orderResp.id;

      toast.success('¡Pedido confirmado con éxito!');
      clear();
      navigate(`/pedido-confirmado/${orderId}`);
    } catch (err) {
      toast.error(err.message || 'Error al procesar el pedido. Intenta de nuevo.');
    }
    setLoading(false);
  };

  const imgErr = (e) => { e.target.src = FALLBACK; };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <motion.div
      className="min-h-screen pt-20"
      style={{ background: 'var(--bg-secondary, #F8F9FB)' }}
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div className="flex items-center gap-2 mb-6 text-xs" variants={slideUp}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }}>Inicio</Link>
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
          <Link to="/carrito" style={{ color: 'var(--text-secondary)' }}>Carrito</Link>
          <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
          <span style={{ color: 'var(--text-primary)' }}>Checkout</span>
        </motion.div>

        <motion.h1 className="text-[28px] font-[800] mb-8" variants={slideUp} style={{ color: 'var(--text-primary)' }}>
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <motion.div
            className="lg:col-span-3 space-y-6"
            variants={slideUp}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="rounded-xl p-6 border border-border" style={{ background: 'var(--bg-surface)' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Resumen del pedido</h2>
              <div className="flex flex-col">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: idx * 0.05 }}
                  >
                    {idx > 0 && <hr className="border-border my-3" />}
                    <div className="flex gap-3 items-center">
                      <motion.div
                        className="w-14 h-[70px] rounded-xl overflow-hidden shrink-0"
                        style={{ background: 'var(--bg-secondary)' }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img src={item.img || FALLBACK} alt={item.nombre} className="w-full h-full object-cover" onError={imgErr} />
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold m-0 truncate" style={{ color: 'var(--text-primary)' }}>{item.nombre}</p>
                        {item.sku && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>SKU: {item.sku}</p>}
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>Cant: {item.qty}</p>
                      </div>
                      <span className="font-bold text-sm whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                        {formatPrecio(item.precio * item.qty)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div className="rounded-xl p-6 border border-border" style={{ background: 'var(--bg-surface)' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Dirección de envío</h2>

              {direcciones.length > 0 && (
                <div className="space-y-3 mb-4">
                  {direcciones.map((dir) => (
                    <motion.label
                      key={dir.id}
                      className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-[1.5px] transition-all ${
                        selectedAddressId === dir.id ? 'border-accent-500' : 'border-border'
                      }`}
                      style={{ background: selectedAddressId === dir.id ? 'var(--accent)' + '08' : 'transparent' }}
                      whileHover={{ scale: 1.01 }}
                    >
                      <input
                        type="radio"
                        name="direccion"
                        checked={selectedAddressId === dir.id}
                        onChange={() => setSelectedAddressId(dir.id)}
                        className="accent-accent-500 mt-1"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} style={{ color: 'var(--accent)' }} />
                          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {dir.alias || 'Mi dirección'}
                            {dir.esPrincipal && (
                              <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                                Principal
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                          {dir.calle} #{dir.numero}, {dir.ciudad}, {dir.departamento}
                        </p>
                      </div>
                    </motion.label>
                  ))}
                </div>
              )}

              {!showNewAddress ? (
                <button
                  onClick={() => setShowNewAddress(true)}
                  className="flex items-center gap-2 text-sm font-medium transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  <Plus size={16} /> Agregar nueva dirección
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 pt-4 border-t border-border"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Nombre completo</label>
                      <input value={form.nombre} onChange={setField('nombre')} placeholder="Juan Pérez" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Dirección</label>
                      <input value={form.direccion} onChange={setField('direccion')} placeholder="Calle 123 #45-67" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ciudad</label>
                      <input value={form.ciudad} onChange={setField('ciudad')} placeholder="Bogotá" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Departamento</label>
                      <input value={form.departamento} onChange={setField('departamento')} placeholder="Cundinamarca" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Código postal</label>
                      <input value={form.codigoPostal} onChange={setField('codigoPostal')} placeholder="110111" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Teléfono</label>
                      <input value={form.telefono} onChange={setField('telefono')} placeholder="300 123 4567" className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-all" style={{ background: 'var(--bg-input)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowNewAddress(false)} className="px-4 py-2 rounded-lg text-sm font-medium border transition-colors" style={{ color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}>
                      Cancelar
                    </button>
                    <button onClick={handleNewAddress} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors" style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}>
                      Guardar dirección
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div className="rounded-xl p-6 border border-border" style={{ background: 'var(--bg-surface)' }}>
              <h2 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Método de pago</h2>
              <div className="flex flex-col gap-3">
                {[
                  { value: 'tarjeta', icon: CreditCard, label: 'Tarjeta de crédito' },
                  { value: 'paypal', icon: Wallet, label: 'PayPal' },
                  { value: 'wompi', icon: Banknote, label: 'Bancolombia / PSE / Nequi' },
                ].map((met) => {
                  const selected = metodo === met.value;
                  const Icon = met.icon;
                  return (
                    <motion.label
                      key={met.value}
                      className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-[1.5px] ${
                        selected ? 'border-accent-500' : 'border-border'
                      }`}
                      style={{ background: selected ? 'rgba(20,184,166,0.05)' : 'transparent' }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <input
                        type="radio"
                        name="pago"
                        value={met.value}
                        checked={selected}
                        onChange={() => setMetodo(met.value)}
                        className="accent-accent-500"
                      />
                      <motion.div animate={selected ? { rotate: [0, -10, 0] } : {}} transition={{ duration: 0.3 }}>
                        <Icon size={20} style={{ color: selected ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      </motion.div>
                      <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{met.label}</span>
                    </motion.label>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          <div className="lg:col-span-2">
            <motion.div
              className="rounded-xl p-6 border border-border sticky top-24"
              style={{ background: 'var(--bg-surface)' }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...smoothIn, delay: 0.3 }}
            >
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Resumen</h2>

              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatPrecio(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>Envío</span>
                  <span className="font-semibold" style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                    {shipping === 0 ? 'Gratis' : formatPrecio(shipping)}
                  </span>
                </div>
                <hr className="border-border my-1" />
                <div className="flex justify-between">
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>Total</span>
                  <motion.span
                    className="text-[22px] font-[800]"
                    key={total + shipping}
                    initial={{ scale: 1.2, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={spring}
                    style={{ color: 'var(--accent)' }}
                  >
                    {formatPrecio(total + shipping)}
                  </motion.span>
                </div>
              </div>

              {metodo === 'wompi' ? (
                <WompiCheckout addressId={selectedAddressId} />
              ) : (
                <motion.button
                  onClick={handleConfirm}
                  disabled={loading || !selectedAddressId}
                  className="w-full py-4 px-6 mt-6 border-none rounded-xl cursor-pointer text-base font-bold transition-all disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    'Confirmar pedido'
                  )}
                </motion.button>
              )}

              <Link
                to="/carrito"
                className="block text-center mt-4 text-sm no-underline transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                ← Volver al carrito
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
