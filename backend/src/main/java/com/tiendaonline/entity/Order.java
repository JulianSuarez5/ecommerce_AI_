package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Pedido de compra.
 * Contiene snapshot de precios al momento del pedido para
 * garantizar integridad histórica ante cambios de catálogo.
 */
@Entity
@Table(name = "orders", indexes = {
    @Index(name = "idx_order_user", columnList = "user_id"),
    @Index(name = "idx_order_estado", columnList = "estado"),
    @Index(name = "idx_order_fecha", columnList = "fecha_pedido")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id", nullable = false)
    private Address address;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private OrderStatus estado = OrderStatus.PENDIENTE;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
    
    @Column(name = "costo_envio", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costoEnvio = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;
    
    @Column(length = 500)
    private String notas;
    
    @CreationTimestamp
    @Column(name = "fecha_pedido", updatable = false)
    private LocalDateTime fechaPedido;
    
    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;
    
    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;
    
    @Column(name = "numero_seguimiento", length = 100)
    private String numeroSeguimiento;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderDetail> detalles = new ArrayList<>();
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;
}
