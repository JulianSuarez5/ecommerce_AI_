package com.tiendaonline.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PedidoRequest {
    @NotNull(message = "La dirección de envío es requerida")
    private Long addressId;

    private String metodoPago = "TARJETA";
    private String notas;
    private String paypalOrderId;

    private List<CarritoItemRequest> items;
}
