import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Ingresa tu email'); return; }
    setLoading(true);
    try {
      await authService.recuperarPassword(email);
      setSent(true);
      toast.success('Revisa tu correo para las instrucciones');
    } catch {
      toast.error('Error al procesar la solicitud');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-[900] text-ink tracking-tight block text-center mb-8">
          CENTROVA
        </Link>

        <div className="bg-surface rounded-lg border border-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
                <Check size={32} className="text-[var(--success)]" />
              </div>
              <h2 className="text-xl font-[800] text-ink mb-2">Revisa tu correo</h2>
              <p className="text-sm text-ink-secondary mb-6">
                Si existe una cuenta con <strong className="text-accent-500">{email}</strong>,
                recibirás instrucciones para recuperar tu contraseña.
              </p>
              <Link to="/login" className="btn-primary inline-flex items-center gap-2">
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-[800] text-ink mb-2">Recuperar contraseña</h2>
              <p className="text-sm text-ink-secondary mb-6">
                Ingresa tu email y te enviaremos instrucciones para crear una nueva contraseña.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Email</label>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholder="tu@email.com"
                    className="input-field"
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar instrucciones'}
                </button>
              </form>
              <Link to="/login" className="flex items-center justify-center gap-2 mt-4 text-sm text-ink-tertiary hover:text-accent-500 transition-colors">
                <ArrowLeft size={14} /> Volver al inicio de sesión
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
