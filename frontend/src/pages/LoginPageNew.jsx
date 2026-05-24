import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sanitizeInput } from '../utils/sanitize';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, spring, smoothIn, staggerContainer, staggerItem, slideUp, slideLeft, pageTransition } from '../utils/motion';

const BRAND_FEATURES = [
  'Envío inteligente y predictivo',
  'Devuelve sin preguntas en 30 días',
  'Productos originales garantizados',
  'Soporte 24/7 en vivo',
];

export default function LoginPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { login, registro, isAuthenticated, isAdmin } = useAuth();
  const [tab, setTab] = useState(params.get('tab') === 'registro' ? 'registro' : 'login');
  const redirectTo = params.get('redirect') || '';

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  const [regNombre, setRegNombre] = useState('');
  const [regSegundoNombre, setRegSegundoNombre] = useState('');
  const [regApellido, setRegApellido] = useState('');
  const [regSegundoApellido, setRegSegundoApellido] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regCalle, setRegCalle] = useState('');
  const [regNumero, setRegNumero] = useState('');
  const [regCiudad, setRegCiudad] = useState('');
  const [regDepartamento, setRegDepartamento] = useState('');
  const [regCodigoPostal, setRegCodigoPostal] = useState('');
  const [regReferencia, setRegReferencia] = useState('');
  const [regPass, setRegPass] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regErrors, setRegErrors] = useState({});
  const [regLoading, setRegLoading] = useState(false);

  const passStrength = (p) => {
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return s;
  };

  const strength = passStrength(regPass);

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!loginEmail.trim()) errs.email = 'Email requerido';
    if (!loginPass.trim()) errs.password = 'Contraseña requerida';
    setLoginErrors(errs);
    if (Object.keys(errs).length) return;

    setLoginLoading(true);
    try {
      const user = await login({ email: loginEmail, password: loginPass });
      toast.success(`¡Bienvenido, ${user.nombre}!`);
      navigate(redirectTo || (user.roles?.includes('ROLE_ADMIN') ? '/admin' : '/'), { replace: true });
    } catch (err) {
      toast.error(err.message || 'Credenciales incorrectas');
    }
    setLoginLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!regNombre.trim()) errs.nombre = 'Nombre requerido';
    if (!regApellido.trim()) errs.apellido = 'Apellido requerido';
    if (!regEmail.trim()) errs.email = 'Email requerido';
    if (!regTelefono.trim()) errs.telefono = 'Teléfono requerido';
    if (!regCalle.trim()) errs.calle = 'Dirección requerida';
    if (!regNumero.trim()) errs.numero = 'Número requerido';
    if (!regCiudad.trim()) errs.ciudad = 'Ciudad requerida';
    if (!regDepartamento.trim()) errs.departamento = 'Departamento requerido';
    if (!regPass.trim()) errs.password = 'Contraseña requerida';
    else if (regPass.length < 8) errs.password = 'Mínimo 8 caracteres';
    setRegErrors(errs);
    if (Object.keys(errs).length) return;

    setRegLoading(true);
    try {
      await registro({
        nombre: regNombre,
        segundoNombre: regSegundoNombre || undefined,
        apellido: regApellido,
        segundoApellido: regSegundoApellido || undefined,
        email: regEmail,
        password: regPass,
        telefono: regTelefono,
        calle: regCalle,
        numero: regNumero,
        ciudad: regCiudad,
        departamento: regDepartamento,
        codigoPostal: regCodigoPostal || undefined,
        referencia: regReferencia || undefined,
      });
      toast.success('¡Cuenta creada exitosamente!');
      navigate(redirectTo || '/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Error al registrarse');
    }
    setRegLoading(false);
  };

  return (
    <motion.div
      className="min-h-screen flex"
      style={{ background: 'var(--bg-primary, linear-gradient(135deg, #f4f7f6 0%, #e9eff1 50%, #dfe9ec 100%))' }}
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...smoothIn, delay: 0.1 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/20 via-transparent to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16">
          <Link to="/" className="text-3xl font-[900] text-ink dark:text-ink-dark tracking-tight">
            CENTROVA
          </Link>
          <div>
            <p className="text-2xl font-bold text-ink dark:text-ink-dark leading-relaxed max-w-md mb-8">
              La experiencia de compra que siempre esperaste.
            </p>
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {BRAND_FEATURES.map((b) => (
                <motion.div key={b} variants={staggerItem} className="flex items-center gap-3">
                  <motion.div
                    className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center flex-shrink-0"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                  >
                    <Check size={14} className="text-accent-500" />
                  </motion.div>
                  <span className="text-sm text-ink-secondary dark:text-ink-dark-secondary">{b}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: 'var(--bg-surface)' }}>
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...smoothIn, delay: 0.2 }}
        >
          <Link to="/" className="lg:hidden text-2xl font-[900] text-ink dark:text-ink-dark tracking-tight block text-center mb-8">
            CENTROVA
          </Link>

          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                onSubmit={handleLogin}
                className="space-y-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div variants={slideUp} initial="hidden" animate="visible">
                  <h2 className="text-2xl font-bold text-ink dark:text-ink-dark mb-2">Inicia sesión</h2>
                  <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">Accede a tu cuenta para continuar</p>
                </motion.div>

                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={loginEmail}
                   onChange={(e) => setLoginEmail(sanitizeInput(e.target.value))}
                  error={loginErrors.email}
                  name="email"
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    label="Contraseña"
                    type={showLoginPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    error={loginErrors.password}
                    name="password"
                    autoComplete="current-password"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-8 text-ink-tertiary hover:text-ink dark:hover:text-ink-dark transition-colors"
                    whileTap={{ scale: 0.9 }}
                  >
                    {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </motion.button>
                </div>

                <div className="flex justify-end">
                  <Link to="/recuperar-password" className="text-sm text-accent-500 hover:text-accent-600 transition-colors font-medium">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={loginLoading}
                    disabled={loginLoading}
                  >
                    Ingresar
                  </Button>
                </motion.div>

                <div className="text-center text-sm text-ink-secondary dark:text-ink-dark-secondary">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('registro')}
                    className="text-accent-500 hover:text-accent-600 font-semibold transition-colors"
                  >
                    Registrate aquí
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key="registro"
                onSubmit={handleRegister}
                className="space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div variants={slideUp} initial="hidden" animate="visible">
                  <h2 className="text-2xl font-bold text-ink dark:text-ink-dark mb-2">Crear cuenta</h2>
                  <p className="text-sm text-ink-secondary dark:text-ink-dark-secondary">Únete a nuestra comunidad</p>
                </motion.div>

                <div className="space-y-4 pb-4 border-b border-border dark:border-border-dark">
                  <p className="text-xs font-semibold text-ink-secondary dark:text-ink-dark-secondary uppercase tracking-wider">Información personal</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Nombre" placeholder="Juan" value={regNombre} onChange={(e) => setRegNombre(sanitizeInput(e.target.value))} error={regErrors.nombre} />
                    <Input label="Segundo nombre" placeholder="(opcional)" value={regSegundoNombre} onChange={(e) => setRegSegundoNombre(sanitizeInput(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Apellido" placeholder="Pérez" value={regApellido} onChange={(e) => setRegApellido(sanitizeInput(e.target.value))} error={regErrors.apellido} />
                    <Input label="Segundo apellido" placeholder="(opcional)" value={regSegundoApellido} onChange={(e) => setRegSegundoApellido(sanitizeInput(e.target.value))} />
                  </div>
                </div>

                <div className="space-y-4 pb-4 border-b border-border dark:border-border-dark">
                  <p className="text-xs font-semibold text-ink-secondary dark:text-ink-dark-secondary uppercase tracking-wider">Dirección</p>
                  <Input label="Calle" placeholder="Carrera 45 # 23-12" value={regCalle} onChange={(e) => setRegCalle(sanitizeInput(e.target.value))} error={regErrors.calle} />
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Número" placeholder="123" value={regNumero} onChange={(e) => setRegNumero(sanitizeInput(e.target.value))} error={regErrors.numero} />
                    <Input label="Código postal" placeholder="(opcional)" value={regCodigoPostal} onChange={(e) => setRegCodigoPostal(sanitizeInput(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input label="Ciudad" placeholder="Bogotá" value={regCiudad} onChange={(e) => setRegCiudad(sanitizeInput(e.target.value))} error={regErrors.ciudad} />
                    <Input label="Departamento" placeholder="Cundinamarca" value={regDepartamento} onChange={(e) => setRegDepartamento(sanitizeInput(e.target.value))} error={regErrors.departamento} />
                  </div>
                  <Input label="Referencia" placeholder="(opcional)" value={regReferencia} onChange={(e) => setRegReferencia(sanitizeInput(e.target.value))} />
                </div>

                <div className="space-y-4 pb-4">
                  <p className="text-xs font-semibold text-ink-secondary dark:text-ink-dark-secondary uppercase tracking-wider">Contacto</p>
                  <Input label="Email" type="email" placeholder="tu@email.com" value={regEmail} onChange={(e) => setRegEmail(sanitizeInput(e.target.value))} error={regErrors.email} name="email" autoComplete="email" />
                  <Input label="Teléfono" type="tel" placeholder="+57 300 123 4567" value={regTelefono} onChange={(e) => setRegTelefono(sanitizeInput(e.target.value))} error={regErrors.telefono} />
                </div>

                <div className="space-y-4">
                  <Input
                    label="Contraseña"
                    type={showRegPass ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    error={regErrors.password}
                    name="new-password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-3 top-80 text-ink-tertiary hover:text-ink dark:hover:text-ink-dark transition-colors"
                  >
                    {showRegPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  {regPass && (
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      transition={spring}
                    >
                      <div className="h-1.5 bg-surface-tertiary dark:bg-surface-tertiary/30 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            strength <= 1 ? 'bg-red-500' : strength === 2 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(strength / 3) * 100}%` }}
                          transition={{ ...spring, stiffness: 100 }}
                        />
                      </div>
                      <div className="space-y-2">
                        {[
                          { check: regPass.length >= 8, text: 'Mínimo 8 caracteres' },
                          { check: /[A-Z]/.test(regPass), text: 'Una letra mayúscula' },
                          { check: /[0-9]/.test(regPass), text: 'Un número' },
                        ].map((r) => (
                          <motion.div
                            key={r.text}
                            className={`flex items-center gap-2 text-xs ${r.check ? 'text-green-600 dark:text-green-400' : 'text-ink-tertiary'}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                          >
                            <motion.div
                              animate={r.check ? { scale: [1, 1.3, 1] } : {}}
                              transition={spring}
                            >
                              <Check size={14} />
                            </motion.div>
                            {r.text}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    loading={regLoading}
                    disabled={regLoading}
                  >
                    Crear cuenta
                  </Button>
                </motion.div>

                <div className="text-center text-sm text-ink-secondary dark:text-ink-dark-secondary">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-accent-500 hover:text-accent-600 font-semibold transition-colors"
                  >
                    Inicia sesión
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
