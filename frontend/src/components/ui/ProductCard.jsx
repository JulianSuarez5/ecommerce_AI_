import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatPrecio } from '../../utils/format';
import { getCategoryFallback } from '../../utils/categoryAssets';
import { getProductImage, resolveImageUrl } from '../../utils/imageUrl';
import { safeText } from '../../utils/sanitize';
import SafeImg from './SafeImg';
import toast from 'react-hot-toast';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden animate-pulse bg-white/40 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
      style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.4))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}>
      <div className="aspect-[4/5]" style={{ backgroundColor: 'var(--bg-secondary, #e4e4e7)' }} />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--bg-secondary, #e4e4e7)' }} />
        <div className="h-4 w-3/4 rounded" style={{ backgroundColor: 'var(--bg-secondary, #e4e4e7)' }} />
        <div className="h-5 w-1/2 rounded" style={{ backgroundColor: 'var(--bg-secondary, #e4e4e7)' }} />
      </div>
    </div>
  );
}

export default function ProductCard({ product, index = 0, animated = true, showSkeleton = false }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);
  const [hoveredImg, setHoveredImg] = useState(null);

  const fallback = getCategoryFallback(product.categoria?.nombre);
  const imgSrc = !imgError ? resolveImageUrl(getProductImage(product)) || fallback : fallback;

  const secondImgRaw = Array.isArray(product.imagenes) && product.imagenes.length > 1
    ? product.imagenes[1] : null;
  const secondImgUrl = secondImgRaw
    ? resolveImageUrl(typeof secondImgRaw === 'string' ? secondImgRaw
        : secondImgRaw.url || secondImgRaw.imagenUrl || secondImgRaw.ruta || secondImgRaw.path || secondImgRaw.filename)
    : null;

  useEffect(() => {
    if (hovered && secondImgUrl) {
      const timer = setTimeout(() => setHoveredImg(secondImgUrl), 200);
      return () => clearTimeout(timer);
    } else {
      setHoveredImg(null);
    }
  }, [hovered, secondImgUrl]);

  const hasDiscount = product.precioOferta && product.precioOferta < product.precio;
  const finalPrice = hasDiscount ? product.precioOferta : product.precio;
  const discountPercent = hasDiscount ? Math.round((1 - product.precioOferta / product.precio) * 100) : 0;
  const is3D = !!(product.modelo3dUrl);

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/producto/${product.id}`);
      return;
    }
    if (product.stock !== undefined && product.stock <= 0) {
      toast.error('Producto agotado');
      return;
    }
    setAdding(true);
    try {
      addItem({ id: product.id, nombre: product.nombre, precio: finalPrice, img: imgSrc, color: 'default', sku: product.sku || '' });
      toast.success('Agregado al carrito');
    } catch {
      toast.error('Error al agregar. Intenta de nuevo.');
    }
    setTimeout(() => setAdding(false), 1200);
  }, [isAuthenticated, addItem, product, navigate, finalPrice, imgSrc]);

  const cardContent = (
    <Link
      to={`/producto/${product.id}`}
      className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0c040]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <article className="relative h-full overflow-hidden rounded-xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}>
        <div className="absolute inset-x-4 top-4 z-10 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            {product.nuevo && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#f0c040] text-[#080808]">
                Nuevo
              </span>
            )}
            {hasDiscount && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-[#f0c040]/20 text-[#f0c040]">
                -{discountPercent}%
              </span>
            )}
            {is3D && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-500">
                <Sparkles size={10} /> 3D
              </span>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          <div className="relative h-full w-full">
            <SafeImg
              src={imgSrc}
              fallback={fallback}
              alt={safeText(product.nombre)}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
              onError={() => setImgError(true)}
            />
            {secondImgUrl && (
              <img
                src={secondImgUrl}
                alt={safeText(product.nombre)}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hoveredImg ? 'opacity-100' : 'opacity-0'}`}
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute bottom-3 left-3 right-3 translate-y-3 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              onClick={handleAdd}
              disabled={adding}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-70 bg-[#f0c040] text-[#080808] hover:bg-[#e0b030]"
            >
              {adding ? (
                <span className="w-4 h-4 border-2 border-[#080808] border-t-transparent rounded-full animate-spin" />
              ) : isAuthenticated ? (
                <><ShoppingCart size={15} /> Agregar</>
              ) : (
                <><LogIn size={15} /> Iniciar sesión</>
              )}
            </button>
          </div>

          {product.stock !== undefined && product.stock < 10 && product.stock > 0 && (
            <span className="absolute bottom-16 left-3 px-2 py-0.5 rounded-full text-[9px] font-medium uppercase tracking-wider bg-red-500/20 text-red-500">
              Stock bajo
            </span>
          )}
        </div>

        <div className="p-4 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 truncate"
            style={{ color: 'var(--text-tertiary, #71717a)' }}>
            {product.categoria?.nombre || 'General'}
          </p>
          <h3 className="text-sm font-semibold leading-tight truncate text-zinc-900 dark:text-white"
            style={{ color: 'var(--text-primary, #18181b)' }}>
            {safeText(product.nombre)}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-white"
                style={{ color: hasDiscount ? 'var(--accent, #f0c040)' : 'var(--text-primary, #18181b)' }}>
                {formatPrecio(finalPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-zinc-400 dark:text-zinc-500"
                  style={{ color: 'var(--text-tertiary, #a1a1aa)' }}>
                  {formatPrecio(product.precio)}
                </span>
              )}
            </div>
            {product.stock !== undefined && product.stock > 0 && (
              <span className="text-[10px] font-semibold text-green-600 dark:text-green-400">
                {product.stock > 5 ? 'En stock' : `${product.stock} disp.`}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.45, delay: (index || 0) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}
