package com.tiendaonline.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CompraRequest {

    @NotNull(message = "El proveedor es requerido")
    private Long supplierId;

    @NotEmpty(message = "Debe incluir al menos un producto")
    private List<Item> items;

    private String notas;

    @Data
    public static class Item {
        @NotNull private Long productId;
        @NotNull @Min(1) private Integer cantidad;
        @NotNull @DecimalMin("0.01") private BigDecimal costoUnitario;
    }
}
