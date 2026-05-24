import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, BadgeCheck } from 'lucide-react';
import { sanitizeInput } from '../../utils/sanitize';
import toast from 'react-hot-toast';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const cleaned = sanitizeInput(email.trim());
    if (!cleaned) { toast.error('Correo inválido'); return; }
    setSent(true);
    toast.success('¡Gracias por suscribirte!');
    setEmail('');
  };

  return (
    <section className="py-20 px-6 lg:px-12 bg-black/[0.02] dark:bg-white/[0.02]" style={{ backgroundColor: 'var(--bg-secondary, rgba(0,0,0,0.02))' }}>
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl p-10 md:p-14 bg-white/80 dark:bg-white/5 border border-zinc-200 dark:border-white/10"
          style={{ backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.8))', borderColor: 'var(--border-color, rgba(0,0,0,0.08))' }}
        >
          <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-6 bg-[#f0c040]/10">
            <Send size={24} className="text-[#f0c040]" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-zinc-900 dark:text-white" style={{ color: 'var(--text-primary, #18181b)' }}>Mantente al día</h2>
          <p className="text-sm mb-8 max-w-md mx-auto leading-relaxed text-zinc-500 dark:text-zinc-400" style={{ color: 'var(--text-secondary, #71717a)' }}>
            Recibe novedades, ofertas exclusivas y lanzamientos directamente en tu correo.
          </p>
          {sent ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-[#f0c040]/15 text-[#f0c040]">
              <BadgeCheck size={18} /> ¡Suscrito!
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3 flex-col sm:flex-row max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(sanitizeInput(e.target.value))}
                required
                className="flex-1 px-5 py-3 rounded-xl text-sm transition-all duration-300 outline-none border bg-white dark:bg-black/20 border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-[#f0c040]"
                style={{ backgroundColor: 'var(--input-bg, white)', borderColor: 'var(--border-color, #d4d4d8)', color: 'var(--text-primary, #18181b)' }}
                autoComplete="email"
              />
              <button type="submit"
                className="px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:brightness-110 active:scale-[0.98] bg-[#f0c040] text-[#080808]">
                Suscribirse
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
