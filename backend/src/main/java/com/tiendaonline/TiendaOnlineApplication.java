package com.tiendaonline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Punto de entrada principal de la aplicación Tienda Online.
 * Arquitectura: Monolítica en capas con Spring Boot 3.x
 */
@SpringBootApplication
@EnableCaching
public class TiendaOnlineApplication {
    public static void main(String[] args) {
        SpringApplication.run(TiendaOnlineApplication.class, args);
    }
}
