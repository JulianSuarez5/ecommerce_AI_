package com.tiendaonline.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * Wrapper genérico para respuestas paginadas.
 */
@Data
@Builder
public class PageResponse<T> {

    @JsonProperty("content")
    private List<T> content;

    @JsonProperty("page")
    private int page;

    @JsonProperty("totalPages")
    private int totalPages;

    @JsonProperty("totalElements")
    private long totalElements;

    @JsonProperty("last")
    private boolean last;

    @JsonProperty("first")
    private boolean first;

    @JsonProperty("size")
    private int size;
}
