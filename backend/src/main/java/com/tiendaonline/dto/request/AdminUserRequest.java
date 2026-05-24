package com.tiendaonline.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminUserRequest {

    @NotBlank(message = "El nombre es requerido")
    @Size(min = 2, max = 100)
    private String nombre;

    @Size(max = 100)
    private String segundoNombre;

    @NotBlank(message = "El apellido es requerido")
    @Size(min = 2, max = 100)
    private String apellido;

    @Size(max = 100)
    private String segundoApellido;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "Mínimo 8 caracteres")
    private String password;

    @Size(max = 20)
    private String telefono;

    private String calle;

    @Size(max = 20)
    private String numero;

    @Size(max = 100)
    private String ciudad;

    @Size(max = 100)
    private String departamento;

    @Size(max = 20)
    private String codigoPostal;

    @Size(max = 300)
    private String referencia;

    @NotBlank(message = "El rol es requerido")
    private String rol;
}
