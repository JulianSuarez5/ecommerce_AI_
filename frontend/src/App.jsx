import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { motion, AnimatePresence, pageTransition } from './utils/motion';
import { useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { loadSavedTheme } from './utils/colorTheme';
import CustomCursor from './components/ui/CustomCursor';

import Navbar from './components/layout/NavbarNew';
import Footer from './components/layout/FooterNew';
import AdminSidebar from './components/admin/AdminSidebar';
import LoadingSpinner from './components/ui/LoadingSpinner';
import AIChatModal from './components/ui/AIChatModal';

import HomePage from './pages/HomePage';
import CatalogoPage from './pages/CatalogoPageNew';
import ProductoPage from './pages/ProductoPage';
import CarritoPage from './pages/CarritoPage';
import LoginPage from './pages/LoginPageNew';
import RegistroPage from './pages/RegistroPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentPage from './pages/PaymentPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import MisPedidosPage from './pages/MisPedidosPage';
import MisDireccionesPage from './pages/MisDireccionesPage';
import PedidoClienteDetailPage from './pages/PedidoClienteDetailPage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProductosAdminPage from './pages/admin/ProductosAdminPage';
import PedidosAdminPage from './pages/admin/PedidosAdminPage';
import PedidoDetailAdminPage from './pages/admin/PedidoDetailAdminPage';
import MarcasAdminPage from './pages/admin/MarcasAdminPage';
import CategoriasAdminPage from './pages/admin/CategoriasAdminPage';
import ProveedoresAdminPage from './pages/admin/ProveedoresAdminPage';
import UsuariosAdminPage from './pages/admin/UsuariosAdminPage';
import ComprasAdminPage from './pages/admin/ComprasAdminPage';
import CompraDetailAdminPage from './pages/admin/CompraDetailAdminPage';
import InventarioAdminPage from './pages/admin/InventarioAdminPage';
import ReportesAdminPage from './pages/admin/ReportesAdminPage';
import ConfiguracionAdminPage from './pages/admin/ConfiguracionAdminPage';

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

function ClientLayout({ children }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {isAuthenticated && <AIChatModal />}
    </div>
  );
}

function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-primary, linear-gradient(135deg, #f4f7f6 0%, #e9eff1 50%, #dfe9ec 100%))' }}>
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen p-6 lg:p-8">
        <AnimatedPage>{children}</AnimatedPage>
      </main>
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && !roles.some((r) => user?.roles?.includes(r))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);
  return <motion.div className="scroll-progress" style={{ scaleX }} />;
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<ClientLayout><AnimatedPage><HomePage /></AnimatedPage></ClientLayout>} />
        <Route path="/catalogo" element={<ClientLayout><AnimatedPage><CatalogoPage /></AnimatedPage></ClientLayout>} />
        <Route path="/producto/:id" element={<ClientLayout><AnimatedPage><ProductoPage /></AnimatedPage></ClientLayout>} />
        <Route path="/carrito" element={<ClientLayout><AnimatedPage><CarritoPage /></AnimatedPage></ClientLayout>} />
        <Route path="/login" element={<AnimatedPage><LoginPage /></AnimatedPage>} />
        <Route path="/registro" element={<AnimatedPage><RegistroPage /></AnimatedPage>} />
        <Route path="/recuperar-password" element={<AnimatedPage><ForgotPasswordPage /></AnimatedPage>} />
        <Route path="/reset-password" element={<AnimatedPage><ResetPasswordPage /></AnimatedPage>} />
        <Route path="/checkout" element={<ClientLayout><AnimatedPage><CheckoutPage /></AnimatedPage></ClientLayout>} />
        <Route path="/pago" element={<ClientLayout><AnimatedPage><PaymentPage /></AnimatedPage></ClientLayout>} />
        <Route path="/pedido-confirmado/:id" element={<ClientLayout><AnimatedPage><OrderConfirmationPage /></AnimatedPage></ClientLayout>} />
        <Route path="/mis-pedidos" element={<ClientLayout><AnimatedPage><MisPedidosPage /></AnimatedPage></ClientLayout>} />
        <Route path="/mis-direcciones" element={<ClientLayout><AnimatedPage><MisDireccionesPage /></AnimatedPage></ClientLayout>} />
        <Route path="/mis-pedidos/:id" element={<ClientLayout><AnimatedPage><PedidoClienteDetailPage /></AnimatedPage></ClientLayout>} />

        <Route
          path="/admin"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><DashboardPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/productos"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><ProductosAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/pedidos"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><PedidosAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/pedidos/:id"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><PedidoDetailAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/marcas"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><MarcasAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/categorias"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><CategoriasAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/proveedores"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><ProveedoresAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/usuarios"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><UsuariosAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/compras"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><ComprasAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/compras/:id"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><CompraDetailAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/inventario"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><InventarioAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/reportes"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><ReportesAdminPage /></AdminLayout></ProtectedRoute>}
        />
        <Route
          path="/admin/configuracion"
          element={<ProtectedRoute roles={['ROLE_ADMIN']}><AdminLayout><ConfiguracionAdminPage /></AdminLayout></ProtectedRoute>}
        />

        <Route path="*" element={<AnimatedPage><NotFoundPage /></AnimatedPage>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [, setThemeVersion] = useState(0)

  useEffect(() => {
    loadSavedTheme()
    const handler = () => setThemeVersion(v => v + 1)
    window.addEventListener('theme-changed', handler)
    return () => window.removeEventListener('theme-changed', handler)
  }, [])

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <CustomCursor />
          <ScrollProgress />
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--surface)',
                color: 'var(--ink)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif',
                boxShadow: 'var(--shadow-modal)',
              },
              success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--surface)' } },
              error: { iconTheme: { primary: 'var(--error)', secondary: 'var(--surface)' } },
            }}
          />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
