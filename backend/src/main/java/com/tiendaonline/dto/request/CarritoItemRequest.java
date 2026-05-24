package com.tiendaonline.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CarritoItemRequest {
    @NotNull(message = "El ID del producto es requerido")
    private Long productoId;

    @NotNull
    @Min(value = 1, message = "La cantidad mínima es 1")
    @Max(value = 99, message = "La cantidad máxima es 99")
    private Integer cantidad;
}
