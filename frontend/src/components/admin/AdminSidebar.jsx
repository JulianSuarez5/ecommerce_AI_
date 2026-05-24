import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingBag, Tags, Building,
  Truck, Users, ClipboardList, Warehouse, BarChart3, LogOut, Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { motion } from '../../utils/motion';
import ColorThemePicker from '../ui/ColorThemePicker';

const navGroups = [
  {
    label: 'Operación',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
      { label: 'Pedidos', to: '/admin/pedidos', icon: ShoppingBag },
      { label: 'Inventario', to: '/admin/inventario', icon: Warehouse },
      { label: 'Compras', to: '/admin/compras', icon: ClipboardList },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { label: 'Productos', to: '/admin/productos', icon: Package },
      { label: 'Categorías', to: '/admin/categorias', icon: Tags },
      { label: 'Marcas', to: '/admin/marcas', icon: Building },
      { label: 'Proveedores', to: '/admin/proveedores', icon: Truck },
    ],
  },
  {
    label: 'Gestión',
    items: [
      { label: 'Usuarios', to: '/admin/usuarios', icon: Users },
      { label: 'Reportes', to: '/admin/reportes', icon: BarChart3 },
      { label: 'Configuración', to: '/admin/configuracion', icon: Settings },
    ],
  },
];

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const isActive = (to) => {
    if (to === '/admin') return pathname === '/admin';
    return pathname.startsWith(to);
  };

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-64 flex flex-col z-40 p-3"
      style={{
        background: 'var(--nav-bg, var(--bg-primary))',
        borderRight: '1px solid var(--border-color)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Link to="/admin" className="flex items-center gap-3 px-3 py-4 mb-4 group">
        <motion.img
          src="/logo.png"
          alt="Centrova"
          className="h-11 w-auto object-contain"
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        <div>
          <p className="text-base font-extrabold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <span>CENTRO</span><span style={{ color: 'var(--accent)' }}>VA</span>
          </p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--text-tertiary)' }}>Command center</p>
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto space-y-5" aria-label="Navegación admin">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-tertiary)' }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ label, to, icon: Icon }) => {
                const active = isActive(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    aria-current={active ? 'page' : undefined}
                    className="relative flex min-h-[40px] items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-200"
                    style={{
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                  >
                    {active && (
                      <div className="absolute inset-0 rounded-xl" style={{ background: 'var(--accent)', opacity: 0.12 }} />
                    )}
                    <Icon size={17} className="relative z-10" style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }} />
                    <span className="relative z-10">{label}</span>
                    {active && (
                      <motion.div
                        layoutId="admin-active"
                        className="ml-auto w-1.5 h-1.5 rounded-full"
                        style={{ background: 'var(--accent)' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-3 mt-3 space-y-2" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--accent)', opacity: 0.2, border: '1px solid var(--accent)' }}
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-bold" style={{ color: 'var(--accent)', opacity: 1 }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || 'A'}
            </span>
          </motion.div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.nombre || 'Administrador'}
            </p>
            <p className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
              {user?.email || ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={logout}
            className="relative flex items-center gap-3 flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--error)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={16} />
            Cerrar sesión
          </motion.button>
          <ColorThemePicker />
        </div>
      </div>
    </aside>
  );
}
