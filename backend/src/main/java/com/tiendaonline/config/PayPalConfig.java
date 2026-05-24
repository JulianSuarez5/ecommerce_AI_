package com.tiendaonline.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "paypal")
public class PayPalConfig {
    private String clientId;
    private String clientSecret;
    private String baseUrl = "https://api-m.sandbox.paypal.com";
}
