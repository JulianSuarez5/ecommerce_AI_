package com.tiendaonline.service.impl;

import com.tiendaonline.dto.response.DashboardMetricasResponse;
import com.tiendaonline.dto.response.ProductoResponse;
import com.tiendaonline.entity.OrderStatus;
import com.tiendaonline.repository.OrderRepository;
import com.tiendaonline.repository.UserRepository;
import com.tiendaonline.service.AdminDashboardService;
import com.tiendaonline.service.ProductoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductoService productoService;

    @Override
    @Transactional(readOnly = true)
    public DashboardMetricasResponse obtenerMetricas() {
        LocalDate hoy = LocalDate.now();
        int mesActual = hoy.getMonthValue();
        int anioActual = hoy.getYear();
        int mesAnterior = mesActual == 1 ? 12 : mesActual - 1;
        int anioAnterior = mesActual == 1 ? anioActual - 1 : anioActual;

        BigDecimal ventasMes = orderRepository.calcularVentasMensuales(mesActual, anioActual);
        BigDecimal ventasMesAnt = orderRepository.calcularVentasMensuales(mesAnterior, anioAnterior);

        long pedidosMes = orderRepository.countByFechaPedidoBetween(
                hoy.withDayOfMonth(1).atStartOfDay(), hoy.plusDays(1).atStartOfDay());
        LocalDateTime inicioMesAnt = hoy.minusMonths(1).withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMesAnt = hoy.withDayOfMonth(1).atStartOfDay();
        long pedidosMesAnt = orderRepository.countByFechaPedidoBetween(inicioMesAnt, finMesAnt);

        long nuevosClientes = userRepository.countByFechaRegistroBetween(
                hoy.withDayOfMonth(1).atStartOfDay(), hoy.plusDays(1).atStartOfDay());

        double cambioVentas = ventasMesAnt.compareTo(BigDecimal.ZERO) > 0
                ? ventasMes.subtract(ventasMesAnt).doubleValue() / ventasMesAnt.doubleValue() * 100
                : 0;
        double cambioPedidos = pedidosMesAnt > 0
                ? (double) (pedidosMes - pedidosMesAnt) / pedidosMesAnt * 100
                : 0;

        List<DashboardMetricasResponse.ChartDataPoint> ingresos = new ArrayList<>();
        List<Object[]> ingresosRaw = orderRepository.ingresosPorDia(hoy.minusDays(30));
        for (Object[] row : ingresosRaw) {
            ingresos.add(DashboardMetricasResponse.ChartDataPoint.builder()
                    .label(row[0].toString())
                    .value((BigDecimal) row[1])
                    .build());
        }

        List<DashboardMetricasResponse.CategorySales> ventasCat = new ArrayList<>();
        List<Object[]> catRaw = orderRepository.ventasPorCategoria();
        for (Object[] row : catRaw) {
            ventasCat.add(DashboardMetricasResponse.CategorySales.builder()
                    .nombre((String) row[0])
                    .total((BigDecimal) row[1])
                    .build());
        }

        List<DashboardMetricasResponse.StatusDistribution> distEstados = new ArrayList<>();
        List<Object[]> distRaw = orderRepository.distribucionEstados();
        for (Object[] row : distRaw) {
            distEstados.add(DashboardMetricasResponse.StatusDistribution.builder()
                    .estado(((OrderStatus) row[0]).name())
                    .cantidad((Long) row[1])
                    .build());
        }

        return DashboardMetricasResponse.builder()
                .pedidosMes(pedidosMes)
                .pedidosMesAnterior(pedidosMesAnt)
                .ventasMes(ventasMes != null ? ventasMes : BigDecimal.ZERO)
                .ventasMesAnterior(ventasMesAnt != null ? ventasMesAnt : BigDecimal.ZERO)
                .pedidosPendientes(orderRepository.countByEstado(OrderStatus.PENDIENTE))
                .productosAgotados((long) productoService.listarAgotados().size())
                .stockBajo((long) productoService.listarConStockBajo().size())
                .clientesActivos(userRepository.countByActivoTrue())
                .nuevosClientesMes(nuevosClientes)
                .cambioVentas(Math.round(cambioVentas * 10.0) / 10.0)
                .cambioPedidos(Math.round(cambioPedidos * 10.0) / 10.0)
                .ingresosDiarios(ingresos)
                .ventasCategoria(ventasCat)
                .distribucionEstados(distEstados)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> productosAgotados() {
        return productoService.listarAgotados();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponse> productosStockBajo() {
        return productoService.listarConStockBajo();
    }

    @Override
    @Transactional(readOnly = true)
    public String obtenerClientesConPedidos() {
        try {
            List<Object[]> totales = orderRepository.countOrdersGroupByUser();
            List<Object[]> pendientes = orderRepository.countByEstadoGroupByUser(OrderStatus.PENDIENTE);

            if (totales == null || totales.isEmpty()) {
                return "=== CLIENTES CON PEDIDOS ===\nNo hay pedidos registrados en el sistema.";
            }

            StringBuilder sb = new StringBuilder("=== CLIENTES CON PEDIDOS ===\n");
            sb.append("TOP CLIENTES POR VOLUMEN DE PEDIDOS:\n");
            totales.stream().limit(10).forEach(row -> {
                String nombre = row[1] != null ? row[1].toString() : "Desconocido";
                String email = row[2] != null ? row[2].toString() : "N/A";
                long total = row[3] instanceof Number ? ((Number) row[3]).longValue() : 0;
                sb.append(String.format("- %s (%s): %d pedidos totales\n", nombre, email, total));
            });

            if (pendientes != null && !pendientes.isEmpty()) {
                sb.append("\nCLIENTES CON PEDIDOS PENDIENTES:\n");
                pendientes.stream().limit(10).forEach(row -> {
                    String nombre = row[1] != null ? row[1].toString() : "Desconocido";
                    String email = row[2] != null ? row[2].toString() : "N/A";
                    long total = row[3] instanceof Number ? ((Number) row[3]).longValue() : 0;
                    sb.append(String.format("- %s (%s): %d pedidos pendientes\n", nombre, email, total));
                });
            }

            return sb.toString();
        } catch (Exception e) {
            log.error("Error al obtener clientes con pedidos: {}", e.getMessage(), e);
            return "=== CLIENTES CON PEDIDOS ===\nNo se pudieron obtener los datos en este momento.";
        }
    }
}
