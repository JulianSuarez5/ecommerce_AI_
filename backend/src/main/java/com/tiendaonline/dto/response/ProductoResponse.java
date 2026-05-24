package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class ProductoResponse {
    private Long id;
    private String nombre;
    private String descripcionCorta;
    private String descripcion;
    private BigDecimal precio;
    private BigDecimal precioOferta;
    private Integer stock;
    private String sku;
    private String imagenPrincipal;
    private String modelo3dUrl;
    private List<String> imagenes;
    private String categoriaNombre;
    private Long categoriaId;
    private Long brandId;
    private String brandNombre;
    private String colores;
    private String especificaciones;
    private String tags;
    private Boolean destacado;
    private Boolean activo;
    private Boolean stockBajo;
    private LocalDateTime fechaCreacion;
}
