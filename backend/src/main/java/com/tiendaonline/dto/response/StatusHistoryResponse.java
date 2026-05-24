package com.tiendaonline.dto.response;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class StatusHistoryResponse {
    private String estado;
    private String comentario;
    private LocalDateTime fecha;
}
