package com.tiendaonline.repository;

import com.tiendaonline.entity.ConfiguracionNegocio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConfiguracionNegocioRepository extends JpaRepository<ConfiguracionNegocio, Long> {
}
