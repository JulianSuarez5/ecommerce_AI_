import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Check } from 'lucide-react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const passStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };

  const strength = passStrength(password);
  const strengthColor = strength <= 1 ? 'bg-[var(--error)]' : strength === 2 ? 'bg-accent-500' : 'bg-[var(--success)]';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanToken = token.trim().toUpperCase();
    if (!cleanToken) { toast.error('Ingresa el código de recuperación'); return; }
    if (!password.trim()) { toast.error('Ingresa una nueva contraseña'); return; }
    if (password.length < 8) { toast.error('Mínimo 8 caracteres'); return; }
    if (password !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return; }

    setLoading(true);
    try {
      await authService.cambiarPassword(cleanToken, password);
      setDone(true);
      toast.success('Contraseña actualizada exitosamente');
    } catch (err) {
      toast.error(err.message || 'Error al cambiar la contraseña');
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="text-2xl font-[900] text-ink tracking-tight block text-center mb-8">CENTROVA</Link>
          <div className="bg-surface rounded-lg border border-border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--success)]/20 flex items-center justify-center">
              <Check size={32} className="text-[var(--success)]" />
            </div>
            <h2 className="text-xl font-[800] text-ink mb-2">Contraseña actualizada</h2>
            <p className="text-sm text-ink-secondary mb-6">Tu contraseña ha sido cambiada exitosamente.</p>
            <Link to="/login" className="btn-primary inline-flex items-center gap-2">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="text-2xl font-[900] text-ink tracking-tight block text-center mb-8">
          CENTROVA
        </Link>

        <div className="bg-surface rounded-lg border border-border p-8">
          <h2 className="text-xl font-[800] text-ink mb-2">Restablecer contraseña</h2>
          <p className="text-sm text-ink-secondary mb-6">Ingresa el código de recuperación que enviamos a tu correo y tu nueva contraseña.</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Código de recuperación</label>
              <input
                value={token}
                onChange={(e) => setToken(e.target.value.toUpperCase())}
                type="text"
                placeholder="Ej: A7K2X9M1"
                className="input-field text-center text-lg tracking-[8px] font-mono font-bold"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Nueva contraseña</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mínimo 8 caracteres"
                  className="input-field pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {password && (
              <div>
                <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                  <div className={`h-full ${strengthColor} transition-all duration-300 rounded-full`} style={{ width: `${(strength / 3) * 100}%` }} />
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                  {[
                    { check: password.length >= 8, text: '8+ caracteres' },
                    { check: /[A-Z]/.test(password), text: 'Mayúscula' },
                    { check: /[0-9]/.test(password), text: 'Número' },
                  ].map((r) => (
                    <span key={r.text} className={`flex items-center gap-1 text-[11px] ${r.check ? 'text-[var(--success)]' : 'text-ink-tertiary'}`}>
                      <Check size={10} /> {r.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-ink-secondary uppercase tracking-wider mb-2">Confirmar contraseña</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                type="password"
                placeholder="Repite la contraseña"
                className={`input-field ${confirmPassword && password !== confirmPassword ? 'border-[var(--error)]' : ''}`}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-[var(--error)] mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-base" disabled={loading}>
              {loading ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
          <p className="text-xs text-ink-tertiary text-center mt-5">
            ¿No tienes un código?{' '}
            <Link to="/recuperar-password" className="text-accent-500 hover:underline">Solicitar nuevo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
