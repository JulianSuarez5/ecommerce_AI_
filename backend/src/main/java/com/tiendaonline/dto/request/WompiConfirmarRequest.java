package com.tiendaonline.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WompiConfirmarRequest {
    @NotBlank(message = "La referencia es requerida")
    private String reference;

    @NotBlank(message = "El ID de transacción de Wompi es requerido")
    private String wompiTransactionId;

    @NotNull(message = "El ID del pedido es requerido")
    private Long orderId;
}
