package com.tiendaonline.service.impl;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.tiendaonline.service.SearchService;

@Service
public class SearchServiceImpl implements SearchService {

    private static final Logger log = LoggerFactory.getLogger(SearchServiceImpl.class);
    private static final String TAVILY_URL = "https://api.tavily.com/search";

    private final RestTemplate restTemplate;
    private final String apiKey;

    public SearchServiceImpl(@Value("${tavily.api-key}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey;
    }

    @Override
    public String searchWeb(String query) {
        try {
            log.info("=== BUSCANDO EN INTERNET VIA TAVILY API ===");
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Payload oficial de Tavily optimizado para IA
            Map<String, Object> requestBody = Map.of(
                "api_key", apiKey,
                "query", query,
                "search_depth", "basic", // Cambia a "advanced" si requieres análisis profundo
                "include_answer", true,
                "max_results", 4
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(TAVILY_URL, request, Map.class);

            if (response.getBody() == null) return "";

            StringBuilder contextBuilder = new StringBuilder();
            
            // Tavily suele devolver una respuesta directa sintetizada en el campo 'answer'
            String directAnswer = (String) response.getBody().get("answer");
            if (directAnswer != null && !directAnswer.isBlank()) {
                contextBuilder.append("Resumen rápido de internet: ").append(directAnswer).append("\n\n");
            }

            // Mapeamos y recorremos los resultados detallados
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.getBody().get("results");
            if (results != null && !results.isEmpty()) {
                contextBuilder.append("Fuentes y fragmentos de noticias encontrados:\n");
                for (Map<String, Object> res : results) {
                    contextBuilder.append("- ").append(res.get("title"))
                                  .append(" (").append(res.get("url")).append("): ")
                                  .append(res.get("content")).append("\n");
                }
            }

            return contextBuilder.toString();

        } catch (Exception e) {
            log.error("Error consultando internet en Tavily: {}", e.getMessage());
            return ""; // Retorna vacío si falla, para permitir que el modelo responda con su base interna
        }
    }
}