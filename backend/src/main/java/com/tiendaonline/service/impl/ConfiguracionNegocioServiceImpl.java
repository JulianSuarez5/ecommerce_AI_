package com.tiendaonline.service.impl;

import com.tiendaonline.entity.ConfiguracionNegocio;
import com.tiendaonline.repository.ConfiguracionNegocioRepository;
import com.tiendaonline.service.ConfiguracionNegocioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConfiguracionNegocioServiceImpl implements ConfiguracionNegocioService {

    private final ConfiguracionNegocioRepository repository;

    @Override
    public ConfiguracionNegocio obtener() {
        return repository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> {
                    ConfiguracionNegocio defaultConfig = ConfiguracionNegocio.builder()
                            .metodosPago("TARJETA (Visa, Mastercard), PAYPAL, TRANSFERENCIA")
                            .politicasEnvio("Envio gratis en pedidos mayores a $100,000. Tiempo de entrega: 3-5 dias habiles.")
                            .politicasDevolucion("Devoluciones dentro de 30 dias. Producto debe estar en su empaque original.")
                            .horarioAtencion("Lunes a Viernes: 8:00 AM - 6:00 PM | Sabados: 9:00 AM - 1:00 PM")
                            .telefonoContacto("+57 (1) 234-5678")
                            .emailContacto("soporte@centrova.co")
                            .direccionTienda("Cra 12 # 34-56, Bogota, Colombia")
                            .diasEntrega("3-5 dias habiles")
                            .infoAdicional("Somos CENTROVA, tu tienda de confianza.")
                            .build();
                    return repository.save(defaultConfig);
                });
    }

    @Override
    public ConfiguracionNegocio guardar(ConfiguracionNegocio config) {
        ConfiguracionNegocio existing = obtener();
        config.setId(existing.getId());
        return repository.save(config);
    }
}
