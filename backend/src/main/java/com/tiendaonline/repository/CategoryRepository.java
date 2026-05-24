package com.tiendaonline.repository;

import com.tiendaonline.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByActivoTrueOrderByNombreAsc();
    boolean existsByNombre(String nombre);
}
