package com.tiendaonline.repository;

import com.tiendaonline.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByReferenciaExterna(String referenciaExterna);
    boolean existsByReferenciaExterna(String referenciaExterna);
}
