package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;

@Data @Builder
public class DireccionResponse {
    private Long id;
    private String alias;
    private String calle;
    private String numero;
    private String ciudad;
    private String departamento;
    private String codigoPostal;
    private String referencia;
    private Boolean esPrincipal;
}
