package com.tiendaonline.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entidad principal del catálogo de productos.
 * 
 * DECISIONES DE DISEÑO:
 * - precio_oferta separado de precio para mantener historial y facilitar reportes
 * - stock_minimo configurable por producto (no un global) para mayor flexibilidad
 * - soft delete con 'activo' para preservar integridad referencial en pedidos
 * - imagen_principal en tabla principal para evitar JOIN en listados
 */
@Entity
@Table(name = "products", indexes = {
    @Index(name = "idx_product_category", columnList = "category_id"),
    @Index(name = "idx_product_sku", columnList = "sku"),
    @Index(name = "idx_product_activo", columnList = "activo"),
    @Index(name = "idx_product_destacado", columnList = "destacado")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String descripcion;

    @Column(name = "descripcion_corta", length = 500)
    private String descripcionCorta;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;

    @Column(name = "precio_oferta", precision = 12, scale = 2)
    private BigDecimal precioOferta;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "stock_minimo", nullable = false)
    @Builder.Default
    private Integer stockMinimo = 5;

    @Column(nullable = false, unique = true, length = 100)
    private String sku;

    @Column(name = "imagen_principal", length = 500)
    private String imagenPrincipal;

    @Column(name = "modelo_3d_url", length = 500)
    private String modelo3dUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String colores;

    @Column(columnDefinition = "VARCHAR(MAX)")
    private String especificaciones;

    @Column(length = 500)
    private String tags;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Column(nullable = false)
    @Builder.Default
    private Boolean destacado = false;

    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    /** Galería de imágenes adicionales */
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductImage> imagenes = new ArrayList<>();

    /** Verifica si el stock está por debajo del mínimo configurado */
    @Transient
    public boolean isStockBajo() {
        return stock > 0 && stock <= stockMinimo;
    }

    /** Retorna el precio efectivo (oferta si existe, sino precio normal) */
    @Transient
    public BigDecimal getPrecioEfectivo() {
        return precioOferta != null ? precioOferta : precio;
    }
}
