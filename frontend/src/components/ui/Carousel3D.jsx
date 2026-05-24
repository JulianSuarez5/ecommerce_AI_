import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Star, LogIn, MousePointer2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrecio } from '../../utils/format';
import { getCategoryFallback } from '../../utils/categoryAssets';
import { getProductImage, resolveImageUrl } from '../../utils/imageUrl';
import SafeImg from './SafeImg';
import toast from 'react-hot-toast';

export default function Carousel3D({ products = [] }) {
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [paused, setPaused] = useState(false);
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const n = products.length;

  const goTo = useCallback((i) => {
    if (busy || !n) return;
    setBusy(true);
    setActive(((i % n) + n) % n);
    setTimeout(() => setBusy(false), 420);
  }, [busy, n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const timer = setInterval(() => goTo(active + 1), 5200);
    return () => clearInterval(timer);
  }, [active, goTo, n, paused]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowLeft') goTo(active - 1);
      if (event.key === 'ArrowRight') goTo(active + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, goTo]);

  if (!n) return null;

  const pos = (i) => {
    let d = i - active;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    const a = Math.abs(d);
    if (a > 2) return { opacity: 0, transform: 'translateX(0) translateZ(-360px) scale(.62)', zIndex: 0, pointerEvents: 'none' };
    const scale = a === 0 ? 1 : a === 1 ? 0.82 : 0.68;
    const translateX = d * 270;
    const translateZ = a === 0 ? 92 : a === 1 ? -70 : -180;
    const rotateY = d * -18;
    return {
      transform: `translateX(${translateX}px) translateZ(${translateZ}px) scale(${scale}) rotateY(${rotateY}deg)`,
      opacity: a === 0 ? 1 : a === 1 ? 0.58 : 0.24,
      zIndex: a === 0 ? 30 : 15 - a,
      filter: a === 0 ? 'brightness(1) saturate(1)' : 'brightness(.86) saturate(.72)',
    };
  };

  const add = (p) => {
    if (!isAuthenticated) { navigate(`/login?redirect=/producto/${p.id}`); return; }
    const fallback = getCategoryFallback(p.categoria?.nombre);
    const img = resolveImageUrl(getProductImage(p)) || fallback;
    addItem({ id: p.id, nombre: p.nombre, precio: p.precioOferta || p.precio, img, color: 'default', sku: p.sku || '' });
    toast.success('Agregado al carrito');
  };

  const activeProduct = products[active];

  return (
    <section
      className="relative overflow-hidden py-10 sm:py-14"
      style={{ perspective: '1500px' }}
      aria-roledescription="carrusel"
      aria-label="Productos destacados"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="relative flex items-center justify-center" style={{ height: '560px', transformStyle: 'preserve-3d' }}>
        {products.map((p, i) => {
          const s = pos(i);
          const on = i === active;
          const fallback = getCategoryFallback(p.categoria?.nombre);
          const img = resolveImageUrl(getProductImage(p)) || fallback;
          const disc = p.precioOferta && p.precioOferta < p.precio;
          return (
            <article
              key={p.id}
              className="absolute cursor-pointer transition-all duration-[420ms] ease-out-expo will-change-transform"
              style={{ ...s, width: 'min(310px, 78vw)' }}
              onClick={() => { if (!on) goTo(i); else navigate(`/producto/${p.id}`); }}
            >
              <div className={`overflow-hidden rounded-2xl bg-surface shadow-card backdrop-blur-2xl transition-all duration-300 ${on ? 'border border-accent-500/60 shadow-hover-strong' : 'border border-border'}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-tertiary">
                  <SafeImg src={img} fallback={fallback} alt={p.nombre} className="h-full w-full object-cover transition-transform duration-700 ease-out-expo" style={{ transform: on ? 'scale(1.04)' : 'scale(1)' }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/55 via-transparent to-surface/10" />
                  {on && <span className="absolute left-4 top-4 rounded-full border border-border bg-surface/84 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-secondary backdrop-blur">Selección activa</span>}
                </div>
                {on && (
                  <div className="space-y-3 p-5">
                    <div>
                      <h3 className="truncate text-lg font-black text-ink">{p.nombre}</h3>
                      <div className="mt-1 flex items-center gap-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={12} className="fill-accent-500 text-accent-500" />)}
                        <span className="ml-1 text-[11px] text-ink-tertiary">4.8 · entrega guiada</span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <span className="text-xl font-black text-accent-600">{formatPrecio(disc ? p.precioOferta : p.precio)}</span>
                        {disc && <span className="ml-2 text-xs text-ink-tertiary line-through">{formatPrecio(p.precio)}</span>}
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); add(p); }} className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-surface transition-all hover:opacity-90 active:scale-95" aria-label={isAuthenticated ? 'Agregar al carrito' : 'Iniciar sesión'}>
                        {isAuthenticated ? <ShoppingCart size={17} /> : <LogIn size={17} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <button type="button" aria-label="Producto anterior" onClick={() => goTo(active - 1)}
        className="absolute left-2 top-1/2 z-40 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/92 text-ink-secondary shadow-card backdrop-blur-xl transition-all hover:-translate-x-0.5 hover:border-accent-500/55 hover:text-accent-500 active:scale-95 sm:left-6">
        <ChevronLeft size={24} />
      </button>
      <button type="button" aria-label="Producto siguiente" onClick={() => goTo(active + 1)}
        className="absolute right-2 top-1/2 z-40 grid h-14 w-14 -translate-y-1/2 place-items-center rounded-full border border-border bg-surface/92 text-ink-secondary shadow-card backdrop-blur-xl transition-all hover:translate-x-0.5 hover:border-accent-500/55 hover:text-accent-500 active:scale-95 sm:right-6">
        <ChevronRight size={24} />
      </button>

      <div className="mt-4 flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/72 px-4 py-2 text-xs font-semibold text-ink-secondary backdrop-blur">
          <MousePointer2 size={13} className="text-accent-500" /> Usa flechas, botones o selecciona una tarjeta
        </div>
        <div className="flex items-center justify-center gap-2">
          {products.map((p, i) => (
            <button key={p.id || i} type="button" aria-label={`Ver ${p.nombre || `producto ${i + 1}`}`} onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${i === active ? 'h-2.5 w-9 bg-ink' : 'h-2.5 w-2.5 bg-ink-tertiary/30 hover:bg-accent-500/80'}`} />
          ))}
        </div>
        {activeProduct && <p className="max-w-md text-center text-sm text-ink-secondary">Vista enfocada en <strong className="text-ink">{activeProduct.nombre}</strong>, sin overlays encima del producto.</p>}
      </div>
    </section>
  );
}
