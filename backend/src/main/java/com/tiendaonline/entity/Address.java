package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Dirección de envío asociada a un usuario.
 * Un usuario puede tener múltiples direcciones; una marcada como principal.
 */
@Entity
@Table(name = "addresses")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Address {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(length = 50)
    @Builder.Default
    private String alias = "Casa";
    
    @Column(nullable = false, length = 200)
    private String calle;
    
    @Column(nullable = false, length = 20)
    private String numero;
    
    @Column(nullable = false, length = 100)
    private String ciudad;
    
    @Column(nullable = false, length = 100)
    private String departamento;
    
    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;
    
    @Column(length = 300)
    private String referencia;
    
    @Column(name = "es_principal", nullable = false)
    @Builder.Default
    private Boolean esPrincipal = false;
}
