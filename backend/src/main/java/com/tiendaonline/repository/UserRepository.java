package com.tiendaonline.repository;

import com.tiendaonline.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndActivoTrue(String email);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByActivoTrue();
    long countByFechaRegistroBetween(LocalDateTime start, LocalDateTime end);

    @Modifying
    @Query("UPDATE User u SET u.ultimoAcceso = :fecha WHERE u.email = :email")
    void actualizarUltimoAcceso(String email, LocalDateTime fecha);
}
