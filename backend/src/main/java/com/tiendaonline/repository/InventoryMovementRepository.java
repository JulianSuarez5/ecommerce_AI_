package com.tiendaonline.repository;

import com.tiendaonline.entity.InventoryMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryMovementRepository extends JpaRepository<InventoryMovement, Long> {
    Page<InventoryMovement> findByProductIdOrderByFechaMovimientoDesc(Long productId, Pageable pageable);
    Page<InventoryMovement> findAllByOrderByFechaMovimientoDesc(Pageable pageable);
}
