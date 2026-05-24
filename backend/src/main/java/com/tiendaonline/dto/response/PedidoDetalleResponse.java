package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class PedidoDetalleResponse {
    private Long productoId;
    private String productoNombre;
    private String imagenPrincipal;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}
