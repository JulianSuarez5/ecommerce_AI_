package com.tiendaonline.controller;

import com.tiendaonline.service.AiContextService;
import com.tiendaonline.service.AiService;
import com.tiendaonline.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final AiService aiService;
    private final AiContextService aiContextService;

    public AiController(AiService aiService, AiContextService aiContextService) {
        this.aiService = aiService;
        this.aiContextService = aiContextService;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(
            @RequestBody Map<String, String> body) {
        String question = body.get("question");
        String contextData = body.get("contextData");

        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "question is required"));
        }

        String response = contextData != null && !contextData.isBlank()
            ? aiService.chatWithContext(question, contextData)
            : aiService.chat(question);

        return ResponseEntity.ok(Map.of("response", response));
    }

    @GetMapping("/contexto-negocio")
    public ResponseEntity<Map<String, String>> contextoNegocio() {
        String context = aiContextService.buildBusinessContext();
        return ResponseEntity.ok(Map.of("contexto", context));
    }

    @GetMapping("/contexto-cliente")
    public ResponseEntity<Map<String, String>> contextoCliente() {
        Long userId = SecurityUtils.getUserId();
        String context = aiContextService.buildClientContext(userId);
        return ResponseEntity.ok(Map.of("contexto", context));
    }

    @GetMapping("/insights")
    public ResponseEntity<Map<String, Object>> insights() {
        List<Map<String, Object>> lista = aiContextService.buildInsights();
        return ResponseEntity.ok(Map.of("insights", lista));
    }

    @GetMapping("/info-negocio")
    public ResponseEntity<Map<String, String>> infoNegocio() {
        String info = aiContextService.buildBusinessInfo();
        return ResponseEntity.ok(Map.of("info", info));
    }
}
