package com.tiendaonline.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "wompi")
public class WompiConfig {
    private String publicKey;
    private String privateKey;
    private String integritySecret;
    private String eventSecret;
    private String baseUrl = "https://sandbox.wompi.co";
    private String redirectUrl = "http://localhost:3000/pedido-confirmado";
}
