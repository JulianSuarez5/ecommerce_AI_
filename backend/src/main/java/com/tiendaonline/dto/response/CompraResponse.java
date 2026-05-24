package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class CompraResponse {
    private Long id;
    private Long supplierId;
    private String supplierNombre;
    private String estado;
    private BigDecimal total;
    private String notas;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaRecepcion;
    private List<ItemResponse> items;
    private List<StatusHistoryResponse> historial;

    @Data @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productNombre;
        private String productSku;
        private String productImagen;
        private Integer cantidad;
        private BigDecimal costoUnitario;
        private BigDecimal subtotal;
    }

    @Data @Builder
    public static class StatusHistoryResponse {
        private String estado;
        private String comentario;
        private String usuario;
        private LocalDateTime fecha;
    }

    @Data @Builder
    public static class EstadoRequest {
        private String estado;
        private String comentario;
    }
}
