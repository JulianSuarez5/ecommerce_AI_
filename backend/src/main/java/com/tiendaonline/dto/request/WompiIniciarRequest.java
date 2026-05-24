package com.tiendaonline.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class WompiIniciarRequest {
    @NotNull(message = "La dirección de envío es requerida")
    private Long addressId;

    @NotEmpty(message = "El pedido debe contener al menos un producto")
    private List<CarritoItemRequest> items;
}
