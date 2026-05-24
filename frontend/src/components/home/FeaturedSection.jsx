import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard, { ProductCardSkeleton } from '../ui/ProductCard';

export default function FeaturedSection({ products, loading }) {
  if (loading) {
    return (
      <section className="py-20 px-6 lg:px-12 bg-black/[0.02] dark:bg-white/[0.02]" style={{ backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Destacados</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Cargando productos...</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 lg:px-12 bg-black/[0.02] dark:bg-white/[0.02]" style={{ backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Destacados</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Lo mejor de nuestro catálogo</p>
          </div>
          <Link to="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-200 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            style={{ color: 'var(--text-tertiary, #71717a)' }}>
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
