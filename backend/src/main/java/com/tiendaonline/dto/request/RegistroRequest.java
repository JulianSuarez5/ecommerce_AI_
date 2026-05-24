package com.tiendaonline.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegistroRequest {

    @NotBlank(message = "El primer nombre es requerido")
    @Size(min = 2, max = 100)
    private String nombre;

    @Size(max = 100)
    private String segundoNombre;

    @NotBlank(message = "El primer apellido es requerido")
    @Size(min = 2, max = 100)
    private String apellido;

    @Size(max = 100)
    private String segundoApellido;

    @NotBlank(message = "El email es requerido")
    @Email(message = "Formato de email inválido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$",
             message = "La contraseña debe contener mayúsculas, minúsculas y números")
    private String password;

    @NotBlank(message = "El teléfono es requerido")
    @Size(min = 7, max = 20)
    private String telefono;

    @NotBlank(message = "La dirección es requerida")
    @Size(max = 200)
    private String calle;

    @NotBlank(message = "El número de dirección es requerido")
    @Size(max = 20)
    private String numero;

    @NotBlank(message = "La ciudad es requerida")
    @Size(max = 100)
    private String ciudad;

    @NotBlank(message = "El departamento es requerido")
    @Size(max = 100)
    private String departamento;

    @Size(max = 20)
    private String codigoPostal;

    @Size(max = 300)
    private String referencia;
}
