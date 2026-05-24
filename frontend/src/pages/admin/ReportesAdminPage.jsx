import { useState } from 'react';
import { FileText, Table, Download, Calendar, Package, DollarSign, Users, ShoppingBag } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dashboardService } from '../../services/dashboardService';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { formatPrecio } from '../../utils/format';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const REPORT_TYPES = [
  { id: 'ventas', label: 'Ventas por rango de fechas', icon: DollarSign },
  { id: 'inventario', label: 'Inventario actual', icon: Package },
  { id: 'productos', label: 'Productos más vendidos', icon: ShoppingBag },
  { id: 'clientes', label: 'Nuevos registros de clientes', icon: Users },
  { id: 'pedidos', label: 'Pedidos por estado', icon: ShoppingBag },
];

export default function ReportesAdminPage() {
  const [reportType, setReportType] = useState('ventas');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [loading, setLoading] = useState(false);

  const generateTimestamp = () => {
    const now = new Date();
    return now.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      switch (reportType) {
        case 'ventas':
          return await dashboardService.get();
        case 'inventario':
          return await productService.getAll({ size: 200 }).then((d) => d.content || d || []);
        case 'productos':
          return await productService.getAll({ size: 200 }).then((d) => d.content || d || []);
        case 'pedidos':
          return await orderService.adminGetAll({ tamano: 200 }).then((d) => d.content || d || []);
        default:
          return [];
      }
    } finally { setLoading(false); }
  };

  const generatePDF = async () => {
    const data = await fetchData();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(232, 201, 126);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('CENTROVA', 14, 28);

    doc.setTextColor(240, 240, 240);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const reportName = REPORT_TYPES.find((r) => r.id === reportType)?.label || 'Reporte';
    doc.text(reportName, 14, 50);
    doc.text(`Generado: ${generateTimestamp()}`, 14, 58);
    if (fechaDesde && fechaHasta) doc.text(`Periodo: ${fechaDesde} al ${fechaHasta}`, 14, 66);

    let startY = 75;
    const columns = [];
    const rows = [];

    switch (reportType) {
      case 'ventas': {
        columns.push({ header: 'Métrica', dataKey: 'metrica' }, { header: 'Valor', dataKey: 'valor' });
        const m = data;
        rows.push({ metrica: 'Ventas del mes', valor: formatPrecio(m.ventasMes || 0) });
        rows.push({ metrica: 'Ventas mes anterior', valor: formatPrecio(m.ventasMesAnterior || 0) });
        rows.push({ metrica: 'Cambio %', valor: `${m.cambioVentas || 0}%` });
        rows.push({ metrica: 'Pedidos del mes', valor: String(m.pedidosMes || 0) });
        rows.push({ metrica: 'Pedidos pendientes', valor: String(m.pedidosPendientes || 0) });
        rows.push({ metrica: 'Clientes activos', valor: String(m.clientesActivos || 0) });
        rows.push({ metrica: 'Nuevos clientes del mes', valor: String(m.nuevosClientesMes || 0) });
        rows.push({ metrica: 'Productos agotados', valor: String(m.productosAgotados || 0) });
        rows.push({ metrica: 'Stock bajo', valor: String(m.stockBajo || 0) });
        break;
      }
      case 'inventario': {
        columns.push({ header: 'SKU', dataKey: 'sku' }, { header: 'Producto', dataKey: 'nombre' }, { header: 'Stock', dataKey: 'stock' }, { header: 'Stock Mín', dataKey: 'min' }, { header: 'Precio', dataKey: 'precio' }, { header: 'Categoría', dataKey: 'cat' });
        (Array.isArray(data) ? data : []).forEach((p) => rows.push({
          sku: p.sku || '', nombre: p.nombre, stock: String(p.stock ?? 0), min: String(p.stockMinimo ?? 0),
          precio: formatPrecio(p.precio), cat: p.categoriaNombre || '',
        }));
        break;
      }
      case 'pedidos': {
        columns.push({ header: 'ID', dataKey: 'id' }, { header: 'Cliente', dataKey: 'cliente' }, { header: 'Fecha', dataKey: 'fecha' }, { header: 'Total', dataKey: 'total' }, { header: 'Estado', dataKey: 'estado' });
        (Array.isArray(data) ? data : []).forEach((o) => rows.push({
          id: `#${o.id}`, cliente: o.userNombre || '', fecha: o.fechaPedido ? new Date(o.fechaPedido).toLocaleDateString() : '',
          total: formatPrecio(o.total), estado: o.estado || '',
        }));
        break;
      }
      default:
        columns.push({ header: 'Datos', dataKey: 'dato' });
        rows.push({ dato: 'Reporte no disponible' });
    }

    doc.autoTable({
      columns,
      body: rows,
      startY,
      styles: { fontSize: 9, cellPadding: 4 },
      headStyles: { fillColor: [232, 201, 126], textColor: [20, 20, 20], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`CENTROVA-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF generado');
  };

  const generateExcel = async () => {
    const data = await fetchData();
    const wb = XLSX.utils.book_new();
    let wsData = [];

    switch (reportType) {
      case 'ventas': {
        const m = data;
        wsData = [
          ['Métrica', 'Valor'],
          ['Ventas del mes', m.ventasMes || 0],
          ['Ventas mes anterior', m.ventasMesAnterior || 0],
          ['Cambio %', `${m.cambioVentas || 0}%`],
          ['Pedidos del mes', m.pedidosMes || 0],
          ['Pedidos pendientes', m.pedidosPendientes || 0],
          ['Clientes activos', m.clientesActivos || 0],
          ['Nuevos clientes', m.nuevosClientesMes || 0],
          ['Productos agotados', m.productosAgotados || 0],
          ['Stock bajo', m.stockBajo || 0],
        ];
        break;
      }
      case 'inventario': {
        wsData = [['SKU', 'Producto', 'Stock', 'Stock Mínimo', 'Precio', 'Categoría']];
        (Array.isArray(data) ? data : []).forEach((p) => wsData.push([p.sku, p.nombre, p.stock, p.stockMinimo, p.precio, p.categoriaNombre]));
        break;
      }
      case 'pedidos': {
        wsData = [['ID', 'Cliente', 'Fecha', 'Total', 'Estado']];
        (Array.isArray(data) ? data : []).forEach((o) => wsData.push([`#${o.id}`, o.userNombre, o.fechaPedido, o.total, o.estado]));
        break;
      }
      default:
        wsData = [['Reporte']];
    }

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    XLSX.writeFile(wb, `CENTROVA-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Excel generado');
  };

  return (
    <div className="space-y-6">
      <div>
          <h1 className="text-2xl font-[800]" style={{ color: 'var(--text-primary)' }}>Reportes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Genera reportes PDF y Excel del sistema</p>
      </div>

      <div className="rounded-lg p-6 space-y-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>Tipo de reporte</label>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((rt) => (
              <button key={rt.id} type="button" onClick={() => setReportType(rt.id)}
                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: reportType === rt.id ? 'transparent' : 'var(--bg-elevated)',
                  color: reportType === rt.id ? 'var(--accent)' : 'var(--text-tertiary)',
                  border: `1px solid ${reportType === rt.id ? 'var(--accent)' : 'var(--border-color)'}`,
                }}
                onMouseEnter={(e) => { if (reportType !== rt.id) { e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseLeave={(e) => { if (reportType !== rt.id) { e.currentTarget.style.color = 'var(--text-tertiary)'; } }}
              >
                {reportType === rt.id && (
                  <div className="absolute inset-0 rounded-xl" style={{ background: 'var(--accent)', opacity: 0.12 }} />
                )}
                <rt.icon size={16} className="relative z-10" />
                <span className="relative z-10">{rt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="input" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-secondary)' }}>Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="input" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={generatePDF} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--error)]/10 text-[var(--error)] hover:bg-[var(--error)]/20 font-semibold rounded-lg transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : <FileText size={16} />} Generar PDF
          </button>
          <button onClick={generateExcel} className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--success)]/10 text-[var(--success)] hover:bg-[var(--success)]/20 font-semibold rounded-lg transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : <Table size={16} />} Generar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
