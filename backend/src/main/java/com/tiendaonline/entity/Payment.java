package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
    
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String metodo = "TARJETA";
    
    @Column(nullable = false, length = 30)
    @Builder.Default
    private String estado = "PENDIENTE";
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;
    
    @Column(name = "referencia_externa", length = 200, unique = true)
    private String referenciaExterna;
    
    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;
}
