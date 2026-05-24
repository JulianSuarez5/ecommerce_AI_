package com.tiendaonline.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WompiIniciarResponse {
    private Long orderId;
    private String reference;
    private Long amountInCents;
    private String currency;
    private String publicKey;
    private String integritySignature;
    private String redirectUrl;
}
