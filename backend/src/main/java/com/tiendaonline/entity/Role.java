package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidad de rol. Valores posibles: ROLE_ADMIN, ROLE_CLIENT.
 * La restricción de valores se maneja en BD y en la capa de servicio.
 */
@Entity
@Table(name = "roles")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre;
}
