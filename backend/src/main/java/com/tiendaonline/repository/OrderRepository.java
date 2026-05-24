package com.tiendaonline.repository;

import com.tiendaonline.entity.Order;
import com.tiendaonline.entity.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserIdOrderByFechaPedidoDesc(Long userId, Pageable pageable);

    Page<Order> findByEstadoOrderByFechaPedidoDesc(OrderStatus estado, Pageable pageable);

    long countByEstado(OrderStatus estado);

    long countByFechaPedidoBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.estado != com.tiendaonline.entity.OrderStatus.CANCELADO AND MONTH(o.fechaPedido) = :mes AND YEAR(o.fechaPedido) = :anio")
    BigDecimal calcularVentasMensuales(@Param("mes") int mes, @Param("anio") int anio);

    @Query(value = """
        SELECT CAST(o.fecha_pedido AS DATE) as dia, COALESCE(SUM(o.total), 0) as total
        FROM orders o
        WHERE o.estado != 'CANCELADO'
          AND o.fecha_pedido >= :fechaInicio
        GROUP BY CAST(o.fecha_pedido AS DATE)
        ORDER BY dia ASC
    """, nativeQuery = true)
    List<Object[]> ingresosPorDia(@Param("fechaInicio") LocalDate fechaInicio);

    @Query(value = """
        SELECT c.nombre, COALESCE(SUM(od.subtotal), 0) as total
        FROM order_details od
        INNER JOIN orders o ON od.order_id = o.id
        INNER JOIN products p ON od.product_id = p.id
        INNER JOIN categories c ON p.category_id = c.id
        WHERE o.estado != 'CANCELADO'
        GROUP BY c.nombre
        ORDER BY total DESC
    """, nativeQuery = true)
    List<Object[]> ventasPorCategoria();

    @Query("SELECT o.estado, COUNT(o) FROM Order o GROUP BY o.estado")
    List<Object[]> distribucionEstados();

    @Query("SELECT o.user.id, o.user.nombre, o.user.email, COUNT(o) FROM Order o GROUP BY o.user.id, o.user.nombre, o.user.email ORDER BY COUNT(o) DESC")
    List<Object[]> countOrdersGroupByUser();

    @Query("SELECT o.user.id, o.user.nombre, o.user.email, COUNT(o) FROM Order o WHERE o.estado = :estado GROUP BY o.user.id, o.user.nombre, o.user.email ORDER BY COUNT(o) DESC")
    List<Object[]> countByEstadoGroupByUser(@Param("estado") OrderStatus estado);
}
