package com.tiendaonline.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductoRequest {
    @NotBlank(message = "El nombre del producto es requerido")
    @Size(max = 200)
    private String nombre;

    @Size(max = 500)
    private String descripcionCorta;

    private String descripcion;

    @NotNull(message = "El precio es requerido")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @DecimalMin(value = "0.01")
    private BigDecimal precioOferta;

    @NotNull
    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stock;

    @Min(value = 0)
    private Integer stockMinimo = 5;

    @NotBlank(message = "El SKU es requerido")
    @Size(max = 100)
    private String sku;

    private String imagenPrincipal;

    private String modelo3dUrl;

    @NotNull(message = "La categoría es requerida")
    private Long categoryId;

    private Long brandId;

    private String colores;

    private String especificaciones;

    private String tags;

    private Boolean destacado = false;
}
