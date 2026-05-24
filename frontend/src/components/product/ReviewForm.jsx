import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Camera, X, Send, LogIn } from 'lucide-react';
import { productService } from '../../services/productService';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function ReviewForm({ productId, isAuthenticated, productNombre, onReviewPublished }) {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleImage = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Selecciona una calificación'); return; }
    if (!comment.trim()) { toast.error('Escribe un comentario'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('rating', rating);
      fd.append('comentario', comment);
      if (image) fd.append('imagen', image);
      const saved = await productService.createReview(productId, fd);
      toast.success('Reseña publicada');
      const newReview = saved || { nombre: 'Tú', date: new Date().toISOString().slice(0, 10), rating, text: comment, imagen: imagePreview };
      onReviewPublished?.(newReview);
      setRating(0);
      setComment('');
      setImage(null);
      setImagePreview(null);
    } catch {
      toast.error('Error al publicar la reseña. Intenta de nuevo.');
    }
    setSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4">
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Inicia sesión para dejar tu opinión y ayudar a otros compradores</p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Button variant="primary" size="md" fullWidth onClick={() => navigate(`/login?redirect=/producto/${productId}`)}>
            <LogIn size={16} /> Iniciar sesión
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-6 shadow-card" style={{ border: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}>
      <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Escribe tu reseña</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Calificación</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <motion.button
                key={s}
                type="button"
                onClick={() => setRating(s)}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Star size={24} className="transition-colors" style={{ color: s <= rating ? 'var(--accent)' : 'var(--text-tertiary)', opacity: s <= rating ? 1 : 0.3, fill: s <= rating ? 'var(--accent)' : 'none' }} />
              </motion.button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Comentario</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comparte tu experiencia con este producto..." rows={4}
            className="w-full px-4 py-3 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/50 resize-none"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
          />
        </div>
        <div>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>Foto (opcional)</p>
          <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed cursor-pointer transition-colors"
            style={{ borderColor: 'var(--border-color)', background: 'var(--bg-elevated)', opacity: 0.3 }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.3'; }}
          >
            <Camera size={18} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{image ? image.name : 'Subir foto del producto'}</span>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
          {imagePreview && (
            <div className="relative mt-2 inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg object-cover" style={{ border: '1px solid var(--border-color)' }} />
              <button type="button" onClick={() => { setImage(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full border flex items-center justify-center transition-colors"
                style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-color)', color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <X size={10} />
              </button>
            </div>
          )}
        </div>
        <motion.button type="submit" disabled={submitting || rating === 0 || !comment.trim()}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
          style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-text)', borderTopColor: 'transparent' }} />
          ) : (
            <><Send size={16} /> Publicar reseña</>
          )}
        </motion.button>
      </form>
    </div>
  );
}
