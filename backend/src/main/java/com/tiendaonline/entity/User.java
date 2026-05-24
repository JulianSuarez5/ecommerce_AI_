package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entidad que representa a un usuario del sistema.
 * Puede tener roles CLIENT y/o ADMIN.
 * Utiliza soft delete (campo 'activo') para preservar historial de pedidos.
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_activo", columnList = "activo")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(name = "segundo_nombre", length = 100)
    private String segundoNombre;

    @Column(nullable = false, length = 100)
    private String apellido;

    @Column(name = "segundo_apellido", length = 100)
    private String segundoApellido;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(length = 20)
    private String telefono;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @CreationTimestamp
    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    @Column(name = "ultimo_acceso")
    private LocalDateTime ultimoAcceso;

    /**
     * Relación M:N con roles. EAGER porque se consulta en cada request autenticado
     * para construir el contexto de seguridad.
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    /** Nombre completo calculado, no persistido */
    @Transient
    public String getNombreCompleto() {
        String n = nombre;
        if (segundoNombre != null && !segundoNombre.isBlank()) n += " " + segundoNombre;
        n += " " + apellido;
        if (segundoApellido != null && !segundoApellido.isBlank()) n += " " + segundoApellido;
        return n;
    }
}
