import { motion } from 'framer-motion';
import { Truck, RotateCcw, Lock } from 'lucide-react';

const trustBadges = [
  { icon: Truck, title: 'Envío Express Asegurado', desc: 'Despacho en 24-48 hrs con seguimiento en tiempo real' },
  { icon: RotateCcw, title: 'Garantía de Devolución', desc: '30 días para devolver sin preguntas ni costo' },
  { icon: Lock, title: 'Pago Seguro SSL', desc: 'Cifrado de 256 bits — tu información protegida' },
];

export default function TrustBadges() {
  return (
    <section className="py-10 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trustBadges.map((badge, i) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-start gap-4 p-5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
                style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-[#f0c040]/10">
                  <Icon size={20} className="text-[#f0c040]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-0.5 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>{badge.title}</h3>
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-secondary, #71717a)' }}>{badge.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
