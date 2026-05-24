package com.tiendaonline.repository;

import com.tiendaonline.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndActivoTrue(Long id);

    boolean existsBySku(String sku);

    /** Listado paginado con filtros opcionales */
    @Query("""
        SELECT p FROM Product p
        WHERE p.activo = true
          AND (:categoryId IS NULL OR p.category.id = :categoryId)
          AND (:precioMin IS NULL OR p.precio >= :precioMin)
          AND (:precioMax IS NULL OR p.precio <= :precioMax)
          AND (:busqueda IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR LOWER(p.descripcionCorta) LIKE LOWER(CONCAT('%', :busqueda, '%')))
          AND (:soloDisponible = false OR p.stock > 0)
        ORDER BY p.destacado DESC, p.fechaCreacion DESC
    """)
    Page<Product> buscarConFiltros(
            @Param("categoryId")     Long categoryId,
            @Param("precioMin")      BigDecimal precioMin,
            @Param("precioMax")      BigDecimal precioMax,
            @Param("busqueda")       String busqueda,
            @Param("soloDisponible") boolean soloDisponible,
            Pageable pageable
    );

    List<Product> findByDestacadoTrueAndActivoTrueOrderByFechaCreacionDesc();

    @Query("SELECT p FROM Product p WHERE p.activo = true AND p.stock = 0")
    List<Product> findProductosAgotados();

    @Query("SELECT p FROM Product p WHERE p.activo = true AND p.stock > 0 AND p.stock <= p.stockMinimo")
    List<Product> findProductosConStockBajo();

    long countByActivoTrue();

    @Query("SELECT p FROM Product p WHERE p.activo = true AND p.precioOferta IS NOT NULL AND p.precioOferta < p.precio ORDER BY p.destacado DESC, p.fechaCreacion DESC")
    List<Product> findProductosConOferta();
}
