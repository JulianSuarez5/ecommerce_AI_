import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SlideCart from '../ui/SlideCart';
import ColorThemePicker from '../ui/ColorThemePicker';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { pathname, search: locationSearch } = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?busqueda=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    setUserMenuOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Inicio', to: '/' },
    { label: 'Catálogo', to: '/catalogo' },
    { label: 'Ofertas', to: '/catalogo?ofertas=true' },
  ];

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    if (to.includes('?')) return pathname + locationSearch === to;
    if (pathname.startsWith(to)) {
      if (to === '/catalogo' && locationSearch.includes('ofertas=true')) return false;
      return true;
    }
    return false;
  };

  // Full name display: "Juan José Vélez" — gracefully trim if too long
  const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(' ') || 'Usuario';
  const displayName = fullName.length > 24 ? fullName.substring(0, 22) + '…' : fullName;

  return (
    <>
      <motion.nav
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-md border-b ${scrolled ? 'shadow-sm dark:shadow-black/20' : ''}`}
        style={{
          backgroundColor: 'var(--nav-bg, rgba(255,255,255,0.8))',
          borderColor: 'var(--border-color, rgba(0,0,0,0.08))',
        }}
      >
        <div className="mx-auto flex h-16 items-center justify-between px-6 lg:px-12 max-w-7xl">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center shrink-0 gap-2" aria-label="Centrova inicio">
              <img src="/logo.png" alt="Centrova" className="h-10 w-10 object-contain" />
              <span className="font-['Space_Grotesk'] text-xl font-black tracking-wider select-none">
                <span style={{ color: 'var(--text-primary)' }}>CENTRO</span>
                <span style={{ color: 'var(--accent)' }}>VA</span>
              </span>
          </Link>

          {/* ── Nav links (desktop) ── */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`relative px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] rounded-lg transition-colors duration-200 ${
                    active
                      ? 'font-bold'
                      : 'hover:bg-zinc-100 dark:hover:bg-white/5'
                  }`}
                  style={{
                    color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    backgroundColor: active ? 'rgba(20,184,166,0.08)' : 'transparent',
                  }}
                >
                  {link.label}
                  {active && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute -bottom-0.5 left-4 right-4 h-[2px] rounded-full"
                      style={{ background: 'var(--accent)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── Persistent Search (desktop) ── */}
          <div className="hidden lg:flex items-center mx-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-48 xl:w-64 pl-9 pr-4 py-1.5 text-sm rounded-lg border outline-none transition-all duration-200 focus:w-64 xl:focus:w-80"
                style={{
                  backgroundColor: 'var(--bg-surface, rgba(255,255,255,0.6))',
                  borderColor: 'var(--border-color, rgba(0,0,0,0.1))',
                  color: 'var(--text-primary)',
                }}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            </form>
          </div>

          {/* ── Actions (desktop) ── */}
          <div className="flex items-center gap-2">
            {/* Color theme picker */}
            <ColorThemePicker />

            {/* Cart button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors duration-200"
              style={{ color: 'var(--text-primary)' }}
              aria-label={`Carrito con ${totalItems} productos`}
            >
              <ShoppingCart size={18} />
              <AnimatePresence>
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center pointer-events-none"
                    style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [0.4, 1.25, 1], opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* User menu (desktop) */}
            {isAuthenticated ? (
              <div className="hidden lg:block relative ml-1 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-primary)' }}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <User size={15} className="shrink-0" style={{ color: 'var(--accent)' }} />
                  <span className="max-w-[160px] truncate">{displayName}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-tertiary)' }}
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.96 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl border shadow-xl overflow-hidden z-10"
                      style={{
                        background: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <p className="text-xs mb-0.5" style={{ color: 'var(--text-tertiary)' }}>Conectado como</p>
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{fullName}</p>
                      </div>

                      {/* Actions */}
                      <div className="p-1.5 space-y-0.5">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg transition-colors"
                            style={{ color: 'var(--text-secondary)' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          >
                            Dashboard Admin
                          </Link>
                        )}
                        <Link
                          to="/mis-pedidos"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          Mis pedidos
                        </Link>
                        <Link
                          to="/mis-direcciones"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                        >
                          Mis direcciones
                        </Link>
                        <button
                          id="navbar-logout-btn"
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={14} />
                          Cerrar sesión
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2 ml-1 pl-3 border-l" style={{ borderColor: 'var(--border-color)' }}>
                <button
                  id="navbar-login-btn"
                  onClick={() => navigate('/login')}
                  className="px-4 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 border hover:bg-zinc-100 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                >
                  Ingresar
                </button>
                <button
                  id="navbar-register-btn"
                  onClick={() => navigate('/login?tab=registro')}
                  className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 hover:brightness-110 shadow-sm"
                  style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Mobile hamburger */}
            <motion.button
              id="navbar-mobile-menu-btn"
              className="lg:hidden p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-primary)' }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
              whileTap={{ scale: 0.9 }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="lg:hidden overflow-hidden border-t"
              style={{ borderColor: 'var(--border-color)' }}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="px-6 py-4 space-y-1 backdrop-blur-md" style={{ background: 'var(--nav-bg)' }}>
                {navLinks.map((link) => {
                  const active = isActive(link.to);
                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        active
                          ? 'font-semibold'
                          : 'hover:bg-zinc-100 dark:hover:bg-white/5'
                      }`}
                      style={{
                        color: active ? 'var(--accent)' : 'var(--text-secondary)',
                        backgroundColor: active ? 'rgba(20,184,166,0.08)' : 'transparent',
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* User section (mobile) */}
                <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-lg mb-2" style={{ background: 'var(--bg-secondary)' }}>
                        <User size={16} className="shrink-0" style={{ color: 'var(--accent)' }} />
                        <div>
                          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Conectado</p>
                          <p className="text-sm font-semibold truncate max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{fullName}</p>
                        </div>
                      </div>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                        >
                          Dashboard Admin
                        </Link>
                      )}
                      <Link
                        to="/mis-pedidos"
                        onClick={() => setMobileOpen(false)}
                        className="block px-4 py-3 text-sm font-medium rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Mis pedidos
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        Cerrar sesión
                      </button>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => { navigate('/login?tab=registro'); setMobileOpen(false); }}
                        className="w-full px-4 py-3 text-sm font-semibold rounded-lg hover:brightness-105 transition-all shadow-sm"
                        style={{ background: 'var(--accent)', color: 'var(--accent-text)' }}
                      >
                        Registrarse
                      </button>
                      <button
                        onClick={() => { navigate('/login'); setMobileOpen(false); }}
                        className="w-full px-4 py-3 text-sm font-medium rounded-lg border transition-colors hover:bg-zinc-50 dark:hover:bg-white/5"
                        style={{ color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                      >
                        Ingresar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Slide-out cart panel */}
      <SlideCart isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
