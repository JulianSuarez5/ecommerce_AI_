import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronRight } from 'lucide-react';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductCard from '../components/ui/ProductCard';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Skeleton from '../components/ui/Skeleton';
import { sanitizeInput } from '../utils/sanitize';
import { motion, AnimatePresence, spring, smoothIn, staggerContainer, staggerItem, slideUp, pageTransition } from '../utils/motion';

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevancia' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'nuevo', label: 'Más reciente' },
];

const COLORS = [
  { name: 'Negro', value: '#111' },
  { name: 'Blanco', value: '#f5f5f5' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Azul', value: '#2563eb' },
  { name: 'Verde', value: '#16a34a' },
  { name: 'Gris', value: '#6b7280' },
  { name: 'Beige', value: '#d4a574' },
  { name: 'Marrón', value: '#8B4513' },
];

export default function CatalogoPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState(params.get('busqueda') || '');
  const [selectedCats, setSelectedCats] = useState(() => {
    const catParam = params.get('categoryId') || params.get('cat');
    return catParam ? [Number(catParam)] : [];
  });
  const [sort, setSort] = useState('relevancia');
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedColor, setSelectedColor] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    categoryService.getAll()
      .then((d) => setCategories(Array.isArray(d) ? d : (d?.content || [])))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async (pageNum = 0, append = false) => {
    setLoading(true);
    try {
      const p = { page: pageNum, size: 12 };
      if (search.trim()) p.busqueda = search.trim();
      const catParam = params.get('categoryId') || params.get('cat');
      if (catParam) p.categoryId = catParam;
      if (selectedCats.length === 1) p.categoryId = selectedCats[0];
      if (params.get('ofertas') === 'true') p.ofertas = true;

      const data = await productService.getAll(p);
      const items = (data?.content) ? data.content : (Array.isArray(data) ? data : []);

      setProducts((prev) => append ? [...prev, ...items] : items);
      setHasMore(data.totalPages ? pageNum < data.totalPages - 1 : items.length >= 12);
    } catch (err) {
      if (!append) setProducts([]);
    }
    setLoading(false);
  }, [search, selectedCats, params]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(0); fetchProducts(0); }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, selectedCats, fetchProducts]);

  const loadMore = () => { const next = page + 1; setPage(next); fetchProducts(next, true); };

  const filtered = products
    .filter((p) => (p.precio || p.precioOferta || 0) <= maxPrice)
    .filter((p) => !selectedColor || true);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'precio_asc') return (a.precio || 0) - (b.precio || 0);
    if (sort === 'precio_desc') return (b.precio || 0) - (a.precio || 0);
    return 0;
  });

const isOfertasPage = params.get('ofertas') === 'true';
const finalProducts = isOfertasPage ? sorted.filter(p => p.precioOferta && p.precioOferta < p.precio) : sorted;

  const toggleCat = (id) => {
    setSelectedCats((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCats([]);
    setSort('relevancia');
    setMaxPrice(5000000);
    setSelectedColor(null);
    setParams({});
  };

  const pricePercent = (maxPrice / 5000000) * 100;

  return (
    <motion.div
      className="min-h-screen pt-20"
      style={{ background: 'var(--bg-primary, linear-gradient(135deg, #f4f7f6 0%, #e9eff1 50%, #dfe9ec 100%))' }}
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <motion.div className="border-b border-border dark:border-border-dark bg-surface dark:bg-surface-dark" variants={slideUp}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center gap-2 text-xs text-ink-secondary dark:text-ink-dark-secondary mb-4">
            <Link to="/" className="hover:text-ink dark:hover:text-ink-dark transition-colors">Inicio</Link>
            <ChevronRight size={14} />
            <span className="text-ink dark:text-ink-dark font-semibold">Catálogo</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-ink dark:text-ink-dark">Catálogo</h1>
              {params.get('ofertas') === 'true' && (
                <motion.div
                  className="mt-3 p-4 rounded-xl bg-gradient-to-r from-teal-500/10 to-teal-500/5 border border-teal-500/20"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="font-bold text-teal-500 text-sm">🔥 Ofertas especiales</p>
                  <p className="text-xs text-ink-secondary mt-1">Productos con descuento por tiempo limitado</p>
                </motion.div>
              )}
            </div>
            <div className="relative max-w-sm flex-1 hidden sm:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary dark:text-ink-dark-tertiary" />
              <input
                value={search}
                onChange={(e) => setSearch(sanitizeInput(e.target.value))}
                type="text"
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-surface text-ink placeholder-ink-tertiary focus:outline-none focus:ring-2 focus:ring-accent-500 shadow-sm"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sticky Category Pills */}
      <motion.div
        className="sticky top-[3.5rem] md:top-[4rem] z-30 -mx-4 lg:-mx-8 px-4 lg:px-8 py-3 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl border-b border-border/50 dark:border-border-dark/50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-tertiary dark:text-ink-dark-tertiary shrink-0 mr-1">Categorías</span>
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => toggleCat(cat.id)}
              className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                selectedCats.includes(cat.id)
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-surface text-ink-secondary border-border hover:border-accent-500/50 hover:text-ink'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {cat.nombre}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 flex-shrink-0">
            <motion.div
              className="sticky top-24 space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...smoothIn, delay: 0.1 }}
            >
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark mb-4">Ordenar</h3>
                <Select
                  options={SORT_OPTIONS}
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                />
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark mb-4">Categorías</h3>
                <div className="space-y-3">
                  {categories.map((cat) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(cat.id)}
                        onChange={() => toggleCat(cat.id)}
                        className="w-4 h-4 rounded border border-border dark:border-border-dark accent-accent-500"
                      />
                      <span className="text-sm text-ink-secondary dark:text-ink-dark-secondary group-hover:text-ink dark:group-hover:text-ink-dark transition-colors">
                        {cat.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark mb-4">Precio máximo</h3>
                <div className="space-y-3">
                  <div className="relative h-2 bg-surface-tertiary dark:bg-surface-tertiary/30 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute top-0 left-0 h-full bg-teal-500 rounded-full"
                      style={{ width: `${pricePercent}%` }}
                      layout
                      transition={spring}
                    />
                    <input
                      type="range"
                      min={0}
                      max={5000000}
                      step={50000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer opacity-0"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-tertiary">$0</span>
                    <motion.span
                      className="font-semibold text-teal-500"
                      key={maxPrice}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                    >
                      ${(maxPrice / 1000).toFixed(0)}k
                    </motion.span>
                    <span className="text-ink-tertiary">$5.000k</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark mb-4">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((c) => (
                    <motion.button
                      key={c.value}
                      onClick={() => setSelectedColor(selectedColor === c.value ? null : c.value)}
                      className={`w-8 h-8 rounded-full transition-all border-2 ${
                        selectedColor === c.value
                          ? 'border-accent-500 shadow-[0_0_0_2px_rgba(20,184,166,0.25)]'
                          : 'border-border'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
              </div>

              <Button variant="outline" size="md" fullWidth onClick={clearFilters}>
                Limpiar filtros
              </Button>
            </motion.div>
          </div>

          <div className="flex-1">
            <div className="lg:hidden mb-6">
              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="md"
                  icon={SlidersHorizontal}
                  fullWidth
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  Filtros
                </Button>
              </motion.div>

              <AnimatePresence>
                {filterOpen && (
                  <motion.div
                    className="mt-4 p-4 rounded-lg border border-border dark:border-border-dark bg-surface dark:bg-surface-dark space-y-6"
                    initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark mb-3">Ordenar</h3>
                      <Select
                        options={SORT_OPTIONS}
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                      />
                    </div>

                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-ink-dark mb-3">Categorías</h3>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <label key={cat.id} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedCats.includes(cat.id)}
                              onChange={() => toggleCat(cat.id)}
                        className="w-4 h-4 rounded border border-border accent-accent-500"
                            />
                            <span className="text-sm text-ink-secondary dark:text-ink-dark-secondary">
                              {cat.nombre}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                    onClick={() => { clearFilters(); setFilterOpen(false); }}
                    className="!font-medium"
                  >
                    Limpiar filtros
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {loading && products.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-surface dark:bg-surface-dark rounded-lg overflow-hidden">
                    <Skeleton height="h-80" />
                    <div className="p-4 space-y-3">
                      <Skeleton height="h-3" width="w-2/3" />
                      <Skeleton height="h-3" width="w-1/2" />
                      <Skeleton height="h-4" width="w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : finalProducts.length === 0 ? (
              <motion.div
                className="py-16 text-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={spring}
              >
                <Search size={40} className="mx-auto mb-4 text-ink-tertiary opacity-50" />
                <h3 className="text-lg font-semibold text-ink dark:text-ink-dark mb-2">
                  No encontramos productos
                </h3>
                <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary mb-6">
                  Intenta con otros filtros o búsqueda
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="primary" size="md" onClick={clearFilters}>
                    Limpiar filtros
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  {finalProducts.map((product, i) => (
                    <motion.div key={product.id} variants={staggerItem}>
                      <ProductCard product={product} index={i} />
                    </motion.div>
                  ))}
                </motion.div>

                {hasMore && (
                  <motion.div
                    className="text-center pt-8 border-t border-border dark:border-border-dark"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        variant="outline"
                        size="lg"
                        loading={loading}
                        onClick={loadMore}
                      >
                        Cargar más
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
