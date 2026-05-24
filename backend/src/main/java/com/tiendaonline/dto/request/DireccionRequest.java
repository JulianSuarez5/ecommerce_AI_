package com.tiendaonline.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class DireccionRequest {
    @Size(max = 50)
    private String alias = "Casa";

    @NotBlank @Size(max = 200)
    private String calle;

    @NotBlank @Size(max = 20)
    private String numero;

    @NotBlank @Size(max = 100)
    private String ciudad;

    @NotBlank @Size(max = 100)
    private String departamento;

    @Size(max = 20)
    private String codigoPostal;

    @Size(max = 300)
    private String referencia;

    private Boolean esPrincipal = false;
}
