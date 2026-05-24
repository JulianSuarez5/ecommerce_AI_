package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data @Builder
public class DashboardMetricasResponse {
    private long pedidosMes;
    private long pedidosMesAnterior;
    private BigDecimal ventasMes;
    private BigDecimal ventasMesAnterior;
    private long pedidosPendientes;
    private long productosAgotados;
    private long stockBajo;
    private long clientesActivos;
    private long nuevosClientesMes;
    private double cambioVentas;
    private double cambioPedidos;

    private List<ChartDataPoint> ingresosDiarios;
    private List<CategorySales> ventasCategoria;
    private List<StatusDistribution> distribucionEstados;

    @Data @Builder
    public static class ChartDataPoint {
        private String label;
        private BigDecimal value;
    }

    @Data @Builder
    public static class CategorySales {
        private String nombre;
        private BigDecimal total;
    }

    @Data @Builder
    public static class StatusDistribution {
        private String estado;
        private long cantidad;
    }
}
