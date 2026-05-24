import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ui/ProductCard';

export default function OffersSection({ products }) {
  if (products.length === 0) return null;
  return (
    <section className="py-20 px-6 lg:px-12" style={{ backgroundColor: 'var(--bg-primary, transparent)' }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Ofertas</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Precios especiales por tiempo limitado</p>
          </div>
          <Link to="/catalogo?ofertas=true"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-200"
            style={{ color: 'var(--accent, #f0c040)' }}>
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
