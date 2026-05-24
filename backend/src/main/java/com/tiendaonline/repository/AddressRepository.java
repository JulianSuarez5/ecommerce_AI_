package com.tiendaonline.repository;

import com.tiendaonline.entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AddressRepository extends JpaRepository<Address, Long> {
    List<Address> findByUserIdOrderByEsPrincipalDesc(Long userId);
    Optional<Address> findByIdAndUserId(Long id, Long userId);
    Optional<Address> findByUserIdAndEsPrincipalTrue(Long userId);
}
