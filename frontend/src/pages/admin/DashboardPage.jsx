import { useState, useEffect } from 'react';
import { DollarSign, Users, ShoppingBag, Package, TrendingUp, TrendingDown, Percent, UserPlus, LineChart, BarChart3, PieChart, Bot } from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';
import { dashboardService } from '../../services/dashboardService';
import { formatPrecio } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import AIInsightsPanel from '../../components/admin/AIInsightsPanel';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1a1a1a',
      titleColor: '#e0e0e0',
      bodyColor: '#a0a0a0',
      borderColor: 'rgba(128,128,128,0.2)',
      borderWidth: 1,
      padding: 12,
    },
  },
  scales: {
    x: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#4B5563', font: { size: 11 } } },
    y: { grid: { color: 'rgba(128,128,128,0.08)' }, ticks: { color: '#4B5563', font: { size: 11 } } },
  },
};

const SECCIONES = [
  { id: 'ingresos', label: 'Ingresos', icon: LineChart },
  { id: 'categorias', label: 'Categorías', icon: BarChart3 },
  { id: 'distribucion', label: 'Distribución', icon: PieChart },
  { id: 'insights', label: 'IA Insights', icon: Bot },
];

export default function DashboardPage() {
  const [metricas, setMetricas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState('ingresos');

  useEffect(() => {
    dashboardService.get()
      .then(setMetricas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-20" size="lg" />;

  const metrics = [
    { label: 'Ventas del mes', value: formatPrecio(metricas?.ventasMes || 0), trend: `${metricas?.cambioVentas >= 0 ? '+' : ''}${metricas?.cambioVentas || 0}%`, up: (metricas?.cambioVentas || 0) >= 0, icon: ShoppingBag },
    { label: 'Ingresos totales', value: formatPrecio((metricas?.ventasMes || 0) + (metricas?.ventasMesAnterior || 0)), trend: 'Acumulado', up: true, icon: DollarSign },
    { label: 'Clientes activos', value: String(metricas?.clientesActivos || 0), trend: `+${metricas?.nuevosClientesMes || 0} nuevos`, up: true, icon: Users },
    { label: 'Pedidos pendientes', value: String(metricas?.pedidosPendientes || 0), trend: `${metricas?.cambioPedidos >= 0 ? '+' : ''}${metricas?.cambioPedidos || 0}% vs mes ant.`, up: (metricas?.cambioPedidos || 0) >= 0, icon: Package },
  ];

  const ingresosLabels = metricas?.ingresosDiarios?.map((d) => {
    const parts = d.label?.split('-');
    return parts ? `${parts[2]}/${parts[1]}` : d.label;
  }) || [];
  const ingresosValues = metricas?.ingresosDiarios?.map((d) => d.value) || [];

  const lineData = {
    labels: ingresosLabels.slice(-14),
    datasets: [{
      label: 'Ingresos',
      data: ingresosValues.slice(-14),
      borderColor: '#14b8a6',
      backgroundColor: 'rgba(20,184,166,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: '#14b8a6',
    }],
  };

  const catLabels = metricas?.ventasCategoria?.map((c) => c.nombre) || [];
  const catValues = metricas?.ventasCategoria?.map((c) => c.total) || [];

  const barData = {
    labels: catLabels,
    datasets: [{
      label: 'Ventas',
      data: catValues,
      backgroundColor: 'rgba(20,184,166,0.6)',
      borderColor: '#14b8a6',
      borderWidth: 1,
      borderRadius: 4,
    }],
  };

  const distLabels = metricas?.distribucionEstados?.map((d) => d.estado) || [];
  const distValues = metricas?.distribucionEstados?.map((d) => d.cantidad) || [];
  const donutColors = ['#14b8a6', '#2dd4bf', '#5eead4', '#0d9488', '#0f766e'];
  const donutBg = distLabels.map((_, i) => donutColors[i % donutColors.length]);

  const donutData = {
    labels: distLabels,
    datasets: [{
      data: distValues,
      backgroundColor: donutBg,
      borderColor: 'transparent',
      borderWidth: 3,
    }],
  };

  const donutOpts = {
    ...chartDefaults,
    plugins: {
      ...chartDefaults.plugins,
      legend: {
        display: true,
        position: 'bottom',
        labels: { color: '#a0a0a0', padding: 16, usePointStyle: true, font: { size: 11 } },
      },
    },
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Resumen general de CENTROVA</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="rounded-xl p-6 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
                <div className="relative w-11 h-11 rounded-lg flex items-center justify-center">
                  <div className="absolute inset-0 rounded-lg" style={{ background: 'var(--accent)', opacity: 0.1 }} />
                  <m.icon size={22} className="relative z-10" style={{ color: 'var(--accent)' }} />
                </div>
                {typeof m.trend === 'string' && m.trend !== 'Acumulado' ? (
                  <span className="flex items-center gap-1 text-xs font-bold" style={{ color: m.up ? 'var(--success)' : 'var(--error)' }}>
                    {m.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />} {m.trend}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{m.trend}</span>
                )}
            </div>
            <p className="text-[28px] font-[800] leading-none" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
          </div>
        ))}
      </div>

      {/* Selector de sección de gráficas */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl w-fit" style={{ background: 'var(--bg-secondary)' }}>
        {SECCIONES.map((s) => {
          const activa = seccionActiva === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSeccionActiva(s.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: activa ? 'var(--bg-surface)' : 'transparent',
                color: activa ? 'var(--accent)' : 'var(--text-secondary)',
                ...(activa ? { boxShadow: 'var(--shadow-subtle)' } : {}),
              }}
            >
              <s.icon size={15} />
              {s.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {seccionActiva === 'ingresos' && (
          <motion.div
            key="ingresos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-lg p-5 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ingresos últimos 14 días</h3>
              <div style={{ height: '300px' }}><Line data={lineData} options={chartDefaults} /></div>
            </div>
          </motion.div>
        )}

        {seccionActiva === 'categorias' && (
          <motion.div
            key="categorias"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-lg p-5 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
              <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Ventas por categoría</h3>
              <div style={{ height: '300px' }}><Bar data={barData} options={chartDefaults} /></div>
            </div>
          </motion.div>
        )}

        {seccionActiva === 'distribucion' && (
          <motion.div
            key="distribucion"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="rounded-lg p-5 shadow-sm xl:col-span-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Distribución de pedidos</h3>
                <div style={{ height: '280px' }} className="flex items-center justify-center">
                  {distValues.length > 0 ? <Doughnut data={donutData} options={donutOpts} /> : <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Sin datos</p>}
                </div>
              </div>
              <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg p-5 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-lg flex items-center justify-center"><div className="absolute inset-0 rounded-lg" style={{ background: 'var(--error)', opacity: 0.1 }} /><Package size={20} className="relative z-10" style={{ color: 'var(--error)' }} /></div>
                    <div>
                      <p className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>{metricas?.productosAgotados || 0}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Productos agotados</p>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="h-2 rounded-full" style={{ background: 'var(--error)', width: `${Math.min((metricas?.productosAgotados || 0) / Math.max((metricas?.productosAgotados || 0) + (metricas?.stockBajo || 0) + 10, 1) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="rounded-lg p-5 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-lg flex items-center justify-center"><div className="absolute inset-0 rounded-lg" style={{ background: 'var(--accent)', opacity: 0.1 }} /><Percent size={20} className="relative z-10" style={{ color: 'var(--accent)' }} /></div>
                    <div>
                      <p className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>{metricas?.stockBajo || 0}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Stock bajo</p>
                    </div>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="h-2 rounded-full" style={{ background: 'var(--accent)', width: `${Math.min((metricas?.stockBajo || 0) / Math.max((metricas?.stockBajo || 0) + 10, 1) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className="rounded-lg p-5 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-lg flex items-center justify-center"><div className="absolute inset-0 rounded-lg" style={{ background: 'var(--success)', opacity: 0.1 }} /><UserPlus size={20} className="relative z-10" style={{ color: 'var(--success)' }} /></div>
                    <div>
                      <p className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>{metricas?.nuevosClientesMes || 0}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Nuevos clientes este mes</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg p-5 shadow-sm" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative w-10 h-10 rounded-lg flex items-center justify-center"><div className="absolute inset-0 rounded-lg" style={{ background: 'var(--accent)', opacity: 0.1 }} /><TrendingUp size={20} className="relative z-10" style={{ color: 'var(--accent)' }} /></div>
                    <div>
                      <p className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>{metricas?.pedidosMes || 0}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Pedidos este mes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {seccionActiva === 'insights' && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-lg border border-teal-500/30 overflow-hidden">
              <AIInsightsPanel metricas={metricas} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
