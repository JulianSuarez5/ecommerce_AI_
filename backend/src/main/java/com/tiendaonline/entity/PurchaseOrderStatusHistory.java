package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_order_status_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurchaseOrderStatusHistory {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurchaseOrder purchaseOrder;

    @Column(nullable = false, length = 30)
    private String estado;

    @Column(length = 500)
    private String comentario;

    @Column(name = "usuario", length = 100)
    private String usuario;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime fecha;
}
