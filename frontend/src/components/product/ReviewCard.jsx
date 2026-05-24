import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export default function ReviewCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-xl p-5 shadow-card"
      style={{ border: '1px solid var(--border-color)', background: 'var(--bg-elevated)' }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: 'var(--accent)', opacity: 0.1, color: 'var(--accent)' }}>
          {review.nombre?.charAt(0) || '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{review.nombre}</span>
            <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{review.date}</span>
          </div>
          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={12} className={s <= review.rating ? 'fill-accent-500 text-accent-500' : ''} style={{ color: s <= review.rating ? 'var(--accent)' : 'var(--text-tertiary)', opacity: s <= review.rating ? 1 : 0.3 }} />
            ))}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{review.text}</p>
          {review.imagen && (
            <img src={review.imagen} alt="Foto de reseña" className="mt-3 rounded-lg max-h-48 object-cover" style={{ border: '1px solid var(--border-color)' }} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
