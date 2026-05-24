package com.tiendaonline.repository;

import com.tiendaonline.entity.Brand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
    List<Brand> findByActivoTrueOrderByNombreAsc();
    boolean existsByNombre(String nombre);
}
