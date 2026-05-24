package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class PedidoResponse {
    private Long id;
    private String estado;
    private BigDecimal subtotal;
    private BigDecimal costoEnvio;
    private BigDecimal total;
    private String notas;
    private LocalDateTime fechaPedido;
    private LocalDateTime fechaEnvio;
    private LocalDateTime fechaEntrega;
    private String numeroSeguimiento;
    private DireccionResponse direccion;
    private List<PedidoDetalleResponse> detalles;
    private String metodoPago;
    private String estadoPago;

    private Long userId;
    private String userNombre;
    private String userEmail;
    private String userTelefono;
    private List<StatusHistoryResponse> historialEstados;
}
