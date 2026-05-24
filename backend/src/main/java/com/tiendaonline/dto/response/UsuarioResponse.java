package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

@Data @Builder
public class UsuarioResponse {
    private Long id;
    private String nombre;
    private String segundoNombre;
    private String apellido;
    private String segundoApellido;
    private String email;
    private String telefono;
    private Boolean activo;
    private Set<String> roles;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimoAcceso;
}
