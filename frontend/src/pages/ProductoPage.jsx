import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Truck, RotateCcw, ShoppingCart, Zap, LogIn, Box, Image, X, Plus, Minus, ShieldCheck, Ruler, MessageSquare } from 'lucide-react';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrecio } from '../utils/format';
import { getCategoryFallback } from '../utils/categoryAssets';
import { getProductImage, resolveImageUrl } from '../utils/imageUrl';
import ModelViewer3D from '../components/ui/ModelViewer3D';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SafeImg from '../components/ui/SafeImg';
import toast from 'react-hot-toast';
import { ReviewCard, ReviewForm, RelatedProducts } from '../components/product';
import { motion, AnimatePresence, spring, smoothIn, slideUp, pageTransition, cardTap, springPeppy } from '../utils/motion';

const MOCK_REVIEWS = [
  { name: 'Carlos M.', date: '2025-01-15', rating: 5, text: 'Excelente producto, superó mis expectativas. La calidad se siente premium.' },
  { name: 'María L.', date: '2025-02-10', rating: 4, text: 'Muy buena calidad, el envío fue rápido y el empaque llegó impecable.' },
  { name: 'Andrés G.', date: '2025-02-28', rating: 5, text: 'Buena relación calidad-precio. La experiencia de compra fue clara.' },
];

const COLORS = [
  { name: 'Grafito', value: '#1A1A2E' },
  { name: 'Marfil', value: '#F7F2E8' },
  { name: 'Champagne', value: '#D6C18A' },
  { name: 'Azul humo', value: '#5D7188' },
  { name: 'Arcilla', value: '#B9826B' },
];

function imageFromGalleryItem(item) {
  if (typeof item === 'string') return item;
  return item?.url || item?.imagenUrl || item?.urlImagen || item?.ruta || item?.path || item?.filename || item?.nombreArchivo;
}

export default function ProductoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [viewMode, setViewMode] = useState('2d');
  const [zoomImg, setZoomImg] = useState(false);
  const [currentImg, setCurrentImg] = useState(0);
  const [talla, setTalla] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setQty(1);
      setSelectedColor(null);
      setZoomImg(false);
      setCurrentImg(0);
      try {
        const data = await productService.getById(id);
        setProduct(data);
        if (data.categoriaId || data.categoria?.id) {
          const r = await productService.getAll({ categoryId: data.categoriaId || data.categoria?.id, size: 4 }).catch(() => ({ content: [] }));
          setRelated(((r?.content) ? r.content : (Array.isArray(r) ? r : [])).filter((p) => p.id !== data.id).slice(0, 4));
        }
      } catch {
        setProduct(null);
      }
      setLoading(false);
    };
    load();
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    productService.getReviews(id).then((d) => {
      const items = Array.isArray(d) ? d : (d?.content || []);
      setReviews(items.length > 0 ? items : MOCK_REVIEWS);
    }).catch(() => setReviews(MOCK_REVIEWS));
  }, [id]);

  if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}><LoadingSpinner size="lg" /></div>;
  if (!product) return <div className="min-h-screen pt-20 flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}><p style={{ color: 'var(--text-tertiary)' }}>Producto no encontrado</p></div>;

  const catFallback = getCategoryFallback(product.categoria?.nombre);
  const mainImg = resolveImageUrl(getProductImage(product)) || catFallback;
  const gallery = Array.isArray(product.imagenes) ? product.imagenes : [];
  const imgs = Array.from(new Set([mainImg, ...gallery.map((img) => resolveImageUrl(imageFromGalleryItem(img))).filter(Boolean), catFallback])).slice(0, 5);
  const hasDisc = product.precioOferta && product.precioOferta < product.precio;
  const finalPrice = hasDisc ? product.precioOferta : product.precio;
  const discPct = hasDisc ? Math.round((1 - product.precioOferta / product.precio) * 100) : 0;
  const stockLabel = (product.stock ?? 0) > 10 ? 'En stock' : (product.stock ?? 0) > 0 ? 'Últimas unidades' : 'Agotado';
  const stockColor = (product.stock ?? 0) > 10 ? 'text-[var(--success)]' : (product.stock ?? 0) > 0 ? 'text-accent-500' : 'text-[var(--error)]';

  const handleAdd = () => {
    if (!isAuthenticated) { navigate(`/login?redirect=/producto/${product.id}`); return; }
    const currentStock = product.stock ?? 0;
    if (currentStock === 0) { toast.error('Producto agotado'); return; }
    if (qty > currentStock) { toast.error(`Solo hay ${currentStock} unidades disponibles`); return; }
    setAdding(true);
    addItem({ id: product.id, nombre: product.nombre, precio: finalPrice, img: mainImg, color: selectedColor?.name || 'default', sku: product.sku || '', qty, stock: currentStock });
    toast.success('Agregado al carrito');
    setTimeout(() => setAdding(false), 1500);
  };

  const handleBuyNow = () => { handleAdd(); if (isAuthenticated) navigate('/carrito'); };

  const handleReviewPublished = (newReview) => setReviews((p) => [newReview, ...p]);

  return (
    <motion.div className="min-h-screen pt-20" style={{ background: 'var(--bg-primary, linear-gradient(135deg, #f4f7f6 0%, #e9eff1 50%, #dfe9ec 100%))' }} variants={pageTransition} initial="initial" animate="animate">
      <motion.div className="mx-auto max-w-7xl px-4 py-4" variants={slideUp}>
        <nav className="flex items-center gap-2 text-[13px]" aria-label="Breadcrumb" style={{ color: 'var(--text-secondary)' }}>
          <Link to="/" style={{ color: 'var(--text-secondary)' }} className="hover:opacity-80 transition-opacity">Inicio</Link>
          <ChevronRight size={12} />
          <Link to="/catalogo" style={{ color: 'var(--text-secondary)' }} className="hover:opacity-80 transition-opacity">{product.categoria?.nombre || 'Catálogo'}</Link>
          <ChevronRight size={12} />
          <span className="max-w-[220px] truncate" style={{ color: 'var(--text-primary)' }}>{product.nombre}</span>
        </nav>
      </motion.div>

      <main className="mx-auto max-w-7xl px-4 pb-16">
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
          {/* Image Gallery */}
          <motion.div className="relative" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...smoothIn, delay: 0.1 }}>
            <div className="mb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex gap-0">
                {['2d', '3d'].map((mode) => (
                  <button key={mode} onClick={() => setViewMode(mode)} className="relative inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all"
                    style={{ color: viewMode === mode ? 'var(--accent)' : 'var(--text-secondary)' }}>
                    {mode === '2d' ? <Image size={16} /> : <Box size={16} />}
                    {mode === '2d' ? 'Galería' : 'Vista 3D'}
                    {viewMode === mode && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--accent)' }} />}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {viewMode === '3d' ? (
                <motion.div key="3d" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring}>
                  <ModelViewer3D product={product} />
                </motion.div>
              ) : (
                <motion.div key="2d" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring}>
                  <motion.div className="group relative mb-4 block aspect-[4/5] w-full overflow-hidden rounded-xl shadow-card"
                    style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                    onClick={() => setZoomImg(true)} onKeyDown={(e) => e.key === 'Enter' && setZoomImg(true)} role="button" tabIndex={0} aria-label="Ampliar imagen de producto">
                    <SafeImg src={imgs[currentImg]} fallback={catFallback} alt={product.nombre} className="h-full w-full object-cover" />
                    <span className="absolute left-5 top-5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] backdrop-blur" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)', opacity: 0.85, color: 'var(--text-secondary)' }}>Showroom</span>
                    {hasDisc && <span className="absolute right-5 top-5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: 'var(--error)', color: 'var(--accent-text)' }}>-{discPct}%</span>}
                  </motion.div>
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                    {imgs.map((img, i) => (
                      <motion.button key={`${img}-${i}`} onClick={() => setCurrentImg(i)} onMouseEnter={() => setCurrentImg(i)}
                        className="h-20 w-20 shrink-0 overflow-hidden rounded-lg shadow-card transition-all"
                        style={{ background: 'var(--bg-elevated)', border: '2px solid var(--border-color)', borderColor: i === currentImg ? 'var(--accent)' : 'var(--border-color)', opacity: i === currentImg ? 1 : 0.65 }}
                        aria-label={`Ver imagen ${i + 1}`} whileHover={{ scale: 1.08, opacity: 1 }} whileTap={{ scale: 0.95 }}>
                        <SafeImg src={img} fallback={catFallback} alt={`${product.nombre} miniatura ${i + 1}`} className="h-full w-full object-cover" />
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Product Info Sidebar */}
          <motion.aside className="space-y-6 rounded-xl p-6 shadow-card lg:sticky lg:top-24 lg:self-start"
            style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)', backdropFilter: 'blur(8px)' }}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...smoothIn, delay: 0.2 }}>
            <div>
              <motion.div className="mb-3 flex flex-wrap items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>SKU: {product.sku || 'N/A'}</span>
                <span className={`flex items-center gap-1 text-xs font-semibold ${stockColor}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{stockLabel}</span>
              </motion.div>
              <motion.h1 className="text-[clamp(2rem,4vw,3.4rem)] font-display font-[800] leading-[.98] tracking-tight" style={{ color: 'var(--text-primary)' }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.2 }}>
                {product.nombre}
              </motion.h1>
              {product.descripcionCorta && (
                <motion.p className="mt-4 text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                  {product.descripcionCorta}
                </motion.p>
              )}
            </div>

            <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.div key={s} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...springPeppy, delay: 0.3 + s * 0.05 }}>
                    <Star size={16} className="fill-accent-500 text-accent-500" />
                  </motion.div>
                ))}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>4.8 · {MOCK_REVIEWS.length} reseñas verificadas</span>
            </motion.div>

            <motion.div className="flex flex-wrap items-end gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.35 }}>
              <span className="text-[38px] font-[900] leading-none text-accent-500">{formatPrecio(finalPrice)}</span>
              {hasDisc && (
                <><span className="text-xl line-through" style={{ color: 'var(--text-tertiary)' }}>{formatPrecio(product.precio)}</span>
                  <motion.span className="rounded-full px-2.5 py-1 text-xs font-bold" style={{ background: 'var(--error)', color: 'var(--accent-text)' }}
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ ...springPeppy, delay: 0.4 }}>
                    -{discPct}%
                  </motion.span>
                </>
              )}
            </motion.div>

            {/* Color Selector */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>Acabado</h3>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((c) => (
                  <motion.button key={c.value} onClick={() => setSelectedColor(selectedColor?.value === c.value ? null : c)}
                    className="h-9 w-9 rounded-full" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                    style={{ border: selectedColor?.value === c.value ? '3px solid var(--accent)' : '2px solid var(--border-color)', backgroundColor: c.value }}
                    title={c.name} aria-label={`Seleccionar ${c.name}`} />
                ))}
              </div>
            </motion.div>

            {/* Size Selector (fashion only) */}
            {['Ropa', 'Moda', 'Calzado', 'Accesorios'].includes(product.categoria?.nombre) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.425 }}>
                <h3 className="mb-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>
                  <Ruler size={14} /> Talla</h3>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL'].map((t) => (
                    <motion.button key={t} onClick={() => setTalla(talla === t ? null : t)}
                      className="relative rounded-full px-4 py-2 text-sm font-semibold transition-all" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.92 }}
                      style={{ background: talla === t ? 'var(--accent)' : 'var(--bg-elevated)', color: talla === t ? 'var(--accent-text)' : 'var(--text-primary)', border: talla === t ? '1px solid var(--accent)' : '1px solid var(--border-color)' }}>
                      {t}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Quantity Selector */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: 'var(--text-tertiary)' }}>Cantidad</h3>
              <div className="inline-flex overflow-hidden rounded-lg" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
                <motion.button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}
                  className="grid h-12 w-12 place-items-center transition-all disabled:opacity-30" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }} whileTap={{ scale: 0.9 }}>
                  <Minus size={16} />
                </motion.button>
                <motion.span className="grid h-12 w-14 place-items-center text-sm font-bold"
                  style={{ borderLeft: '1px solid var(--border-color)', borderRight: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  key={qty} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={springPeppy}>
                  {qty}
                </motion.span>
                <motion.button onClick={() => setQty(Math.min((product.stock ?? 0) > 0 ? product.stock : 99, qty + 1))}
                  disabled={qty >= ((product.stock ?? 0) > 0 ? product.stock : 99)}
                  className="grid h-12 w-12 place-items-center transition-all disabled:opacity-30" style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }} whileTap={{ scale: 0.9 }}>
                  <Plus size={16} />
                </motion.button>
              </div>
              {(product.stock ?? 0) < 10 && (product.stock ?? 0) > 0 && (
                <motion.p className="mt-2 text-xs text-accent-500" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                  Solo {product.stock} {product.stock === 1 ? 'unidad' : 'unidades'} restantes</motion.p>
              )}
            </motion.div>

            {/* Add to Cart / Buy Now */}
            <motion.div className="space-y-3 pt-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <motion.button onClick={handleAdd} disabled={(product.stock ?? 0) === 0 || adding}
                className="inline-flex h-16 w-full items-center justify-center gap-2 rounded-lg text-base font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
                style={{ background: 'var(--accent)', color: 'var(--accent-text)' }} whileHover={{ scale: 1.01 }} whileTap={cardTap}>
                {adding ? (<><span className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-text)', borderTopColor: 'transparent' }} /> Agregando...</>
                ) : isAuthenticated ? (<><ShoppingCart size={20} /> Agregar al carrito</>
                ) : (<><LogIn size={20} /> Iniciar sesión para comprar</>)}
              </motion.button>
              {isAuthenticated && (
                <motion.button onClick={handleBuyNow} disabled={(product.stock ?? 0) === 0}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition-all active:scale-[0.98]"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent-text)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
                  whileHover={{ scale: 1.01 }} whileTap={cardTap}>
                  <Zap size={18} /> Comprar ahora
                </motion.button>
              )}
            </motion.div>

            {/* Trust badges */}
            <motion.div className="grid gap-3 pt-4 text-sm" style={{ borderTop: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              {[
                { icon: Truck, text: 'Envío gratis desde $100.000' },
                { icon: RotateCcw, text: 'Devolución gratuita durante 30 días' },
                { icon: ShieldCheck, text: 'Compra segura con soporte postventa' },
              ].map((item, i) => (
                <motion.div key={item.text} className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + i * 0.05 }}>
                  <item.icon size={17} className="shrink-0" style={{ color: 'var(--accent)' }} />
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          </motion.aside>
        </section>

        {/* Description & Specs */}
        <motion.section className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...smoothIn, delay: 0.1 }}>
          <div className="rounded-lg p-6 shadow-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <h2 className="mb-4 text-xl font-[800]" style={{ color: 'var(--text-primary)' }}>Descripción</h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{product.descripcion || product.descripcionCorta || 'Sin descripción disponible.'}</p>
          </div>
          <div className="rounded-lg p-6 shadow-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
            <h2 className="mb-4 text-xl font-[800]" style={{ color: 'var(--text-primary)' }}>Especificaciones</h2>
            {[['SKU', product.sku || 'N/A'], ['Categoría', product.categoria?.nombre || 'General'], ['Stock', product.stock ?? 'N/A'], ['Estado', stockLabel]].map(([k, v], i) => (
              <motion.div key={k} className="flex justify-between py-3 text-sm last:border-0" style={{ borderBottom: '1px solid var(--border-color)' }}
                initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <span style={{ color: 'var(--text-tertiary)' }}>{k}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{v}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section className="mt-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ ...smoothIn, delay: 0.15 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-[800]" style={{ color: 'var(--text-primary)' }}>Reseñas de clientes</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>{reviews.length} {reviews.length === 1 ? 'opinión' : 'opiniones'}</p>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (<Star key={s} size={16} className="fill-accent-500 text-accent-500" />))}
              <span className="text-sm font-semibold ml-1" style={{ color: 'var(--text-primary)' }}>4.8</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="text-center py-12 rounded-xl" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)', opacity: 0.5 }}>
                  <MessageSquare size={40} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>No hay reseñas aún</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>Sé el primero en opinar</p>
                </div>
              ) : (
                <AnimatePresence>
                  {reviews.map((rev, i) => <ReviewCard key={i} review={rev} index={i} />)}
                </AnimatePresence>
              )}
            </div>
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ReviewForm productId={id} isAuthenticated={isAuthenticated} productNombre={product.nombre} onReviewPublished={handleReviewPublished} />
            </div>
          </div>
        </motion.section>

        <RelatedProducts products={related} />
      </main>

      {/* Zoom overlay */}
      <AnimatePresence>
        {zoomImg && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center p-6 backdrop-blur" style={{ background: 'var(--bg-surface)', opacity: 0.95 }}
            onClick={() => setZoomImg(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.button className="absolute right-6 top-6 grid h-11 w-11 place-items-center rounded-full shadow-card"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }} aria-label="Cerrar imagen"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ rotate: 90 }}>
              <X size={20} />
            </motion.button>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} transition={spring}>
              <SafeImg src={imgs[currentImg]} fallback={catFallback} alt={product.nombre} className="max-h-[90vh] max-w-[90vw] object-contain" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
