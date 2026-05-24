import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

function AnimatedCounter({ value, suffix }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (!isInView) return;
    const steps = 30;
    const inc = value / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(cur));
    }, 1500 / steps);
    return () => clearInterval(t);
  }, [isInView, value]);
  return <span ref={ref}>{display}{suffix}</span>;
}

export default function StatsBand() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="py-14 border-y border-zinc-200 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]"
      style={{ borderColor: 'var(--border-color, rgba(0,0,0,0.08))', backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 5000, suffix: '+', label: 'Productos' },
            { value: 1200, suffix: '+', label: 'Clientes felices' },
            { value: 98, suffix: '%', label: 'Satisfacción' },
            { value: 30, suffix: ' días', label: 'Devolución gratis' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[clamp(1.5rem,3vw,2.5rem)] font-bold mb-1 text-[#f0c040]">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-tertiary, #71717a)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
