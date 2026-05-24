package com.tiendaonline.service.impl;

import com.tiendaonline.entity.ConfiguracionNegocio;
import com.tiendaonline.entity.OrderStatus;
import com.tiendaonline.repository.CategoryRepository;
import com.tiendaonline.repository.ConfiguracionNegocioRepository;
import com.tiendaonline.repository.OrderRepository;
import com.tiendaonline.repository.ProductRepository;
import com.tiendaonline.repository.UserRepository;
import com.tiendaonline.service.AiContextService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiContextServiceImpl implements AiContextService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ConfiguracionNegocioRepository configuracionNegocioRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public String buildBusinessContext() {
        var productosOferta = productRepository.findProductosConOferta();
        var productosDestacados = productRepository.findByDestacadoTrueAndActivoTrueOrderByFechaCreacionDesc();

        String categoriasStr = categoryRepository.findAll().stream()
            .map(c -> String.format("- %s", c.getNombre()))
            .collect(Collectors.joining("\n"));

        String productosOfertaStr = productosOferta.stream()
            .limit(10)
            .map(p -> {
                BigDecimal precioOriginal = p.getPrecio();
                BigDecimal precioOferta = p.getPrecioOferta();
                int descuento = precioOriginal.compareTo(BigDecimal.ZERO) > 0 
                    ? precioOriginal.subtract(precioOferta).multiply(BigDecimal.valueOf(100)).divide(precioOriginal, 0, java.math.RoundingMode.HALF_UP).intValue()
                    : 0;
                return String.format("- %s: $%s (antes $%s, %d%% descuento, Stock: %d, SKU: %s)", 
                    p.getNombre(), precioOferta.toPlainString(), precioOriginal.toPlainString(), descuento, p.getStock(), p.getSku());
            })
            .collect(Collectors.joining("\n"));
        if (productosOferta.size() > 10) productosOfertaStr += String.format("\n- ... y %d productos mas en oferta", productosOferta.size() - 10);

        String productosDestacadosStr = productosDestacados.stream()
            .limit(5)
            .map(p -> {
                BigDecimal precio = p.getPrecioOferta() != null ? p.getPrecioOferta() : p.getPrecio();
                return String.format("- %s: $%s (Stock: %d, SKU: %s)", p.getNombre(), precio.toPlainString(), p.getStock(), p.getSku());
            })
            .collect(Collectors.joining("\n"));

        return String.format(
            "%s\n\n" +
            "=== CATEGORIAS DISPONIBLES ===\n%s\n\n" +
            "=== PRODUCTOS EN OFERTA/DESCUENTO (PRECIO_OFERTA ACTIVO) ===\n%s\n\n" +
            "=== PRODUCTOS DESTACADOS (POPULARES) ===\n%s\n\n" +
            "%s\n\n" +
            "%s",
            buildBusinessInfo(),
            categoriasStr,
            productosOfertaStr.isEmpty() ? "No hay productos en oferta actualmente" : productosOfertaStr,
            productosDestacadosStr,
            buildBusinessStats(),
            buildInventoryAlerts()
        );
    }

    @Override
    public String buildClientContext(Long userId) {
        var orders = orderRepository.findByUserIdOrderByFechaPedidoDesc(userId, org.springframework.data.domain.PageRequest.of(0, 3));

        if (orders.isEmpty()) {
            return "El usuario no tiene pedidos registrados.";
        }

        String infoNegocio = buildBusinessInfo();

        return infoNegocio + "\n\nPEDIDOS RECIENTES DEL CLIENTE:\n" +
            orders.getContent().stream()
                .map(o -> String.format(
                    "- Pedido #%d: %s | Total: $%s | Fecha: %s",
                    o.getId(), o.getEstado(), o.getTotal().toPlainString(), o.getFechaPedido().toLocalDate()
                ))
                .collect(Collectors.joining("\n"));
    }

    @Override
    public List<Map<String, Object>> buildInsights() {
        List<Map<String, Object>> insights = new ArrayList<>();

        var stockBajo = productRepository.findProductosConStockBajo();
        if (!stockBajo.isEmpty()) {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("tipo", "danger");
            alert.put("titulo", "Alerta de stock bajo");
            alert.put("descripcion", String.format(
                "%d productos estan por debajo del stock minimo. %s necesita reposicion urgente.",
                stockBajo.size(), stockBajo.get(0).getNombre()
            ));
            insights.add(alert);
        }

        var agotados = productRepository.findProductosAgotados();
        if (!agotados.isEmpty()) {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("tipo", "danger");
            alert.put("titulo", "Productos agotados");
            alert.put("descripcion", String.format(
                "%d productos estan completamente agotados: %s, entre otros.",
                agotados.size(), agotados.get(0).getNombre()
            ));
            insights.add(alert);
        }

        long pendientes = orderRepository.countByEstado(OrderStatus.PENDIENTE);
        if (pendientes > 0) {
            Map<String, Object> alert = new LinkedHashMap<>();
            alert.put("tipo", "warning");
            alert.put("titulo", "Pedidos pendientes");
            alert.put("descripcion", String.format(
                "Hay %d pedidos pendientes de confirmacion. Revisa la seccion de pedidos.",
                pendientes
            ));
            insights.add(alert);
        }

        LocalDate hoy = LocalDate.now();
        int mes = hoy.getMonthValue();
        int anio = hoy.getYear();
        BigDecimal ventasMes = orderRepository.calcularVentasMensuales(mes, anio);
        long clientesActivos = userRepository.countByActivoTrue();

        if (ventasMes.compareTo(BigDecimal.ZERO) > 0) {
            Map<String, Object> metric = new LinkedHashMap<>();
            metric.put("tipo", "positive");
            metric.put("titulo", "Ventas del mes");
            metric.put("descripcion", String.format(
                "Las ventas del mes alcanzan $%s con %d clientes activos.",
                ventasMes.toPlainString(), clientesActivos
            ));
            insights.add(metric);
        }

        var ventasCat = orderRepository.ventasPorCategoria();
        if (!ventasCat.isEmpty()) {
            Map<String, Object> metric = new LinkedHashMap<>();
            metric.put("tipo", "positive");
            metric.put("titulo", "Categoria lider");
            metric.put("descripcion", String.format(
                "%s es la categoria con mayores ventas del mes.",
                ventasCat.get(0)[0]
            ));
            insights.add(metric);
        }

        if (insights.isEmpty()) {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("tipo", "info");
            fallback.put("titulo", "Todo en orden");
            fallback.put("descripcion", "No hay alertas pendientes. El negocio opera con normalidad.");
            insights.add(fallback);
        }

        return insights;
    }

    @Override
    public String buildBusinessInfo() {
        ConfiguracionNegocio config = configuracionNegocioRepository.findAll()
                .stream()
                .findFirst()
                .orElse(null);

        if (config == null) return "No hay informacion de configuracion disponible.";

        return "=== INFORMACION OFICIAL DEL NEGOCIO (CONFIGURACION DEL ADMIN) ===\n" +
            String.format(
                "NOMBRE: CENTROVA\n" +
                "METODOS DE PAGO ACEPTADOS: %s\n" +
                "POLITICAS DE ENVIO: %s\n" +
                "POLITICAS DE DEVOLUCION: %s\n" +
                "HORARIO DE ATENCION: %s\n" +
                "TELEFONO DE CONTACTO: %s\n" +
                "EMAIL DE CONTACTO: %s\n" +
                "DIRECCION: %s\n" +
                "DIAS DE ENTREGA ESTIMADOS: %s\n" +
                "INFORMACION ADICIONAL: %s\n\n" +
                "=== CAPACIDADES DEL SISTEMA ===\n" +
                "- Visualizacion 3D de productos: CENTROVA ya cuenta con prototipos 3D integrados para productos seleccionados.\n" +
                "- Vista 360 de productos mediante arrastre y zoom.\n" +
                "- Chat inteligente con IA (Bender) disponible 24/7.\n" +
                "- Dashboard administrativo con metricas en tiempo real, alertas de stock, ventas por categoria y distribucion de pedidos.",
                config.getMetodosPago() != null ? config.getMetodosPago() : "No especificado",
                config.getPoliticasEnvio() != null ? config.getPoliticasEnvio() : "No especificado",
                config.getPoliticasDevolucion() != null ? config.getPoliticasDevolucion() : "No especificado",
                config.getHorarioAtencion() != null ? config.getHorarioAtencion() : "No especificado",
                config.getTelefonoContacto() != null ? config.getTelefonoContacto() : "No especificado",
                config.getEmailContacto() != null ? config.getEmailContacto() : "No especificado",
                config.getDireccionTienda() != null ? config.getDireccionTienda() : "No especificado",
                config.getDiasEntrega() != null ? config.getDiasEntrega() : "No especificado",
                config.getInfoAdicional() != null ? config.getInfoAdicional() : "No especificado"
            );
    }

    @Override
    public String buildBusinessStats() {
        LocalDate hoy = LocalDate.now();
        int mes = hoy.getMonthValue();
        int anio = hoy.getYear();

        BigDecimal ventasMes = orderRepository.calcularVentasMensuales(mes, anio);
        long pendientes = orderRepository.countByEstado(OrderStatus.PENDIENTE);
        long confirmados = orderRepository.countByEstado(OrderStatus.CONFIRMADO);
        long enviados = orderRepository.countByEstado(OrderStatus.ENVIADO);
        long entregados = orderRepository.countByEstado(OrderStatus.ENTREGADO);
        long nuevosClientes = userRepository.countByFechaRegistroBetween(
            hoy.withDayOfMonth(1).atStartOfDay(), hoy.plusDays(1).atStartOfDay()
        );
        long clientesActivos = userRepository.countByActivoTrue();
        long totalProductos = productRepository.countByActivoTrue();

        List<Object[]> ventasCat = orderRepository.ventasPorCategoria();
        String categoriaTop = ventasCat.isEmpty() ? "Sin datos" : (String) ventasCat.get(0)[0];
        BigDecimal catTopVenta = ventasCat.isEmpty() ? BigDecimal.ZERO : (BigDecimal) ventasCat.get(0)[1];

        return "=== ESTADISTICAS DEL NEGOCIO ===\n" +
            String.format(
                "TOTAL PRODUCTOS ACTIVOS: %d\n" +
                "VENTAS DEL MES: $%s\n" +
                "PEDIDOS POR ESTADO: Pendientes=%d | Confirmados=%d | Enviados=%d | Entregados=%d\n" +
                "CATEGORIA CON MAS VENTAS: %s ($%s)\n" +
                "CLIENTES ACTIVOS: %d\n" +
                "NUEVOS CLIENTES DEL MES: %d",
                totalProductos,
                ventasMes.toPlainString(),
                pendientes, confirmados, enviados, entregados,
                categoriaTop, catTopVenta.toPlainString(),
                clientesActivos, nuevosClientes
            );
    }

    @Override
    public String buildInventoryAlerts() {
        var stockBajo = productRepository.findProductosConStockBajo();
        var agotados = productRepository.findProductosAgotados();

        StringBuilder sb = new StringBuilder("=== ALERTAS DE INVENTARIO ===\n");

        if (stockBajo.isEmpty() && agotados.isEmpty()) {
            sb.append("Sin alertas. Inventario en niveles normales.");
            return sb.toString();
        }

        if (!stockBajo.isEmpty()) {
            sb.append(String.format("PRODUCTOS CON STOCK BAJO (%d):\n", stockBajo.size()));
            stockBajo.stream().limit(5).forEach(p ->
                sb.append(String.format("- %s: %d unidades (minimo: %d, SKU: %s)\n",
                    p.getNombre(), p.getStock(), p.getStockMinimo(), p.getSku()))
            );
            if (stockBajo.size() > 5) {
                sb.append(String.format("- ... y %d productos mas\n", stockBajo.size() - 5));
            }
        }

        if (!agotados.isEmpty()) {
            sb.append(String.format("PRODUCTOS AGOTADOS (%d):\n", agotados.size()));
            agotados.stream().limit(5).forEach(p ->
                sb.append(String.format("- %s (SKU: %s)\n", p.getNombre(), p.getSku()))
            );
            if (agotados.size() > 5) {
                sb.append(String.format("- ... y %d productos mas", agotados.size() - 5));
            }
        }

        return sb.toString();
    }
}
