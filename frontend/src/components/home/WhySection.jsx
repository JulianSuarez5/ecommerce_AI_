import { motion } from 'framer-motion';
import { Eye, Bot, ShieldCheck, RefreshCw } from 'lucide-react';

const whyCentrova = [
  { icon: Eye, title: 'Vista 3D inmersiva', desc: 'Gira, acerca y explora cada producto desde todos los ángulos antes de comprar.' },
  { icon: Bot, title: 'Recomendación con IA', desc: 'Nuestro algoritmo aprende tus preferencias y te sugiere lo que realmente necesitas.' },
  { icon: ShieldCheck, title: 'Compra protegida', desc: 'Pago seguro, envío rastreado y soporte real antes, durante y después de tu compra.' },
  { icon: RefreshCw, title: 'Devolución fácil', desc: '30 días para devolver. Sin preguntas, sin complicaciones.' },
];

export default function WhySection() {
  return (
    <section className="py-20 px-6 lg:px-12 bg-black/[0.02] dark:bg-white/[0.02]" style={{ backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Por qué CENTROVA</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Cuatro razones para confiar en nosotros</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whyCentrova.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-[#f0c040]/10">
                  <Icon size={22} className="text-[#f0c040]" />
                </div>
                <h3 className="text-base font-semibold mb-2 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>{item.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-secondary, #71717a)' }}>{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
