package com.tiendaonline.repository;

import com.tiendaonline.entity.PurchaseOrder;
import com.tiendaonline.entity.PurchaseOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findAllByOrderByFechaCreacionDesc();
    List<PurchaseOrder> findByEstadoOrderByFechaCreacionDesc(PurchaseOrderStatus estado);
    long countByEstado(PurchaseOrderStatus estado);
}
