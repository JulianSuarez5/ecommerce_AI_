import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Cpu, ShieldCheck, Truck, RotateCcw, Lock, ArrowRight } from 'lucide-react';

function CountdownTimer() {
  const [time, setTime] = useState({ h: 12, m: 0, s: 0 });
  useEffect(() => {
    const total = 12 * 3600;
    const interval = setInterval(() => {
      setTime((prev) => {
        const secs = (prev.h * 3600 + prev.m * 60 + prev.s) - 1;
        if (secs <= 0) return { h: 12, m: 0, s: 0 };
        return {
          h: Math.floor(secs / 3600),
          m: Math.floor((secs % 3600) / 60),
          s: secs % 60,
        };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex items-center gap-2 text-sm font-mono" style={{ color: 'var(--text-primary, #18181b)' }}>
      <span className="tabular-nums font-bold text-lg">{String(time.h).padStart(2, '0')}</span>
      <span style={{ color: 'var(--text-tertiary, #71717a)' }}>:</span>
      <span className="tabular-nums font-bold text-lg">{String(time.m).padStart(2, '0')}</span>
      <span style={{ color: 'var(--text-tertiary, #71717a)' }}>:</span>
      <span className="tabular-nums font-bold text-lg">{String(time.s).padStart(2, '0')}</span>
    </div>
  );
}

export default function FlashDealsGrid() {
  return (
    <section className="px-6 md:px-16 pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 ease-out bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md"
          style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f0c040]/12">
              <Zap size={20} className="text-[#f0c040]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Ofertas Relámpago</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Terminan en</p>
            </div>
          </div>
          <CountdownTimer />
          <Link to="/catalogo?ofertas=true"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#f0c040] transition-colors hover:text-[#f0c040]/80">
            Ver ofertas <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 ease-out bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md"
          style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-indigo-500/12">
              <Cpu size={20} className="text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Electrónica Premium</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Audio, setups y más</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 mb-4" style={{ color: 'var(--text-secondary, #71717a)' }}>
            Descubre lo último en tecnología con envío exprés y garantía extendida.
          </p>
          <Link to="/catalogo?categoryId=1"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-300">
            Explorar <ArrowRight size={14} />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="rounded-2xl p-6 hover:-translate-y-1 transition-transform duration-300 ease-out bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10 backdrop-blur-md"
          style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/12">
              <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Garantía Centrova</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>Compra protegida</p>
            </div>
          </div>
          <div className="space-y-2">
            {[
              { icon: Truck, text: 'Envío exprés 24-48 hrs' },
              { icon: RotateCcw, text: 'Devolución gratis 30 días' },
              { icon: Lock, text: 'Pago cifrado SSL 256-bit' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary, #71717a)' }}>
                  <Icon size={14} className="text-emerald-500 shrink-0" />
                  <span>{item.text}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
