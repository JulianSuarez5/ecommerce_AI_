import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cpu, Shirt, Home as HomeIcon, Dumbbell, ArrowRight } from 'lucide-react';

const categoriesBento = [
  { id: 1, nombre: 'Electrónica', icon: Cpu, desc: 'Audio, setups y movilidad', large: true,
    image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=800&q=85' },
  { id: 2, nombre: 'Moda', icon: Shirt, desc: 'Prendas con intención',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=85' },
  { id: 3, nombre: 'Hogar', icon: HomeIcon, desc: 'Diseño y funcionalidad',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=85' },
  { id: 4, nombre: 'Deportes', icon: Dumbbell, desc: 'Rendimiento diario',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=85' },
];

export default function BentoCategories() {
  return (
    <section className="py-20 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold tracking-tight leading-none mb-2 text-zinc-900 dark:text-white">
              Categorías
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Explora por interés</p>
          </div>
          <Link to="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.12em] transition-colors duration-200 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            style={{ color: 'var(--text-tertiary, #71717a)' }}>
            Ver todo <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {categoriesBento.map((cat, i) => {
            const Icon = cat.icon;
            if (cat.large) {
              return (
                <Link key={cat.id} to={`/catalogo?categoryId=${cat.id}`} className="md:col-span-2 group block">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.05 }}
                    className="relative overflow-hidden rounded-2xl h-full min-h-[280px] md:min-h-[320px] transition-transform duration-300 hover:scale-[1.01] bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                    style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
                  >
                    <img src={cat.image} alt={cat.nombre}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-60 transition-opacity duration-500"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f2027]/90 via-[#0f2027]/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f0c040]/15">
                          <Icon size={20} className="text-[#f0c040]" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>{cat.nombre}</h3>
                      </div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-secondary, #71717a)' }}>{cat.desc}</p>
                    </div>
                  </motion.div>
                </Link>
              );
            }
            return (
              <Link key={cat.id} to={`/catalogo?categoryId=${cat.id}`} className="group block">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
                  className="relative overflow-hidden rounded-2xl min-h-[220px] md:min-h-[240px] transition-transform duration-300 hover:scale-[1.02] bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                  style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
                >
                  <img src={cat.image} alt={cat.nombre}
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2027]/80 via-[#0f2027]/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#f0c040]/15">
                        <Icon size={16} className="text-[#f0c040]" />
                      </div>
                      <h3 className="text-base font-semibold text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>{cat.nombre}</h3>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-secondary, #71717a)' }}>{cat.desc}</p>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
