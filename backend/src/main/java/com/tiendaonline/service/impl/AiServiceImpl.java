package com.tiendaonline.service.impl;

import java.net.InetSocketAddress;
import java.net.ProxySelector;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import com.tiendaonline.service.AiContextService;
import com.tiendaonline.service.AiRole;
import com.tiendaonline.service.AiService;
import com.tiendaonline.service.SearchService;

@Service
public class AiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(AiServiceImpl.class);

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final AiContextService aiContextService;
    private final SearchService searchService;

    public AiServiceImpl(
            @Value("${groq.api-key}") String apiKey, 
            AiContextService aiContextService,
            SearchService searchService) {
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .proxy(ProxySelector.getDefault())
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(60));
        this.restTemplate = new RestTemplate(factory);
        this.apiKey = apiKey;
        this.aiContextService = aiContextService;
        this.searchService = searchService;
    }

    @Override
    public String chat(String question) {
        return chatConRol(question, null, AiRole.CLIENTE);
    }

    @Override
    public String chatWithContext(String question, String contextData) {
        return chatConRol(question, contextData, AiRole.CLIENTE);
    }

    @Override
    public String chatConRol(String question, String contextData, AiRole role) {
        String systemPrompt;
        String combinedContext;

        if (role == AiRole.ADMINISTRADOR) {
            systemPrompt = buildPromptAdmin();
            combinedContext = aiContextService.buildBusinessInfo();
            String stats = aiContextService.buildBusinessStats();
            if (stats != null && !stats.isBlank()) {
                combinedContext += "\n\n" + stats;
            }
            String alerts = aiContextService.buildInventoryAlerts();
            if (alerts != null && !alerts.isBlank()) {
                combinedContext += "\n\n" + alerts;
            }
        } else {
            systemPrompt = buildPromptCliente();
            combinedContext = aiContextService.buildBusinessContext();
        }

        if (contextData != null && !contextData.isBlank()) {
            combinedContext += "\n\n" + contextData;
        }

        if (role != AiRole.ADMINISTRADOR) {
            String internetContext = searchService.searchWeb(question);
            if (internetContext != null && !internetContext.isBlank()) {
                combinedContext += "\n\n=== INFORMACION DE INTERNET (BUSQUEDA EN TIEMPO REAL) ===\n" + internetContext;
            }
        }

        String userContent = String.format(
                "%s\n\n=== PREGUNTA DEL USUARIO ===\n%s",
                combinedContext, question
        );

        return callGroq(systemPrompt, userContent);
    }

    private String callGroq(String systemPrompt, String userContent) {
        try {
            log.info("=== LLAMANDO A GROQ API [role={}] ===", systemPrompt.contains("ADMINISTRADOR") ? "ADMIN" : "CLIENTE");
            log.debug("System prompt: {} chars, User content: {} chars", systemPrompt.length(), userContent.length());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            Map<String, Object> systemMessage = Map.of(
                    "role", "system",
                    "content", systemPrompt
            );
            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", userContent
            );

            Map<String, Object> requestBody = Map.of(
                    "model", "llama-3.3-70b-versatile",
                    "messages", List.of(systemMessage, userMessage),
                    "temperature", 0.4
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, request, Map.class);

            log.info("Groq status code: {}", response.getStatusCode());

            if (response.getBody() == null) {
                log.warn("Groq response body is NULL");
                return fallbackNoService();
            }

            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices == null || choices.isEmpty()) {
                log.warn("Groq: no choices in response.");
                return fallbackNoService();
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> messageResult = (Map<String, Object>) firstChoice.get("message");
            if (messageResult == null) {
                log.warn("Groq: message content is missing.");
                return fallbackNoService();
            }

            String text = (String) messageResult.get("content");
            log.info("Groq respondió con éxito ({} caracteres)", text.length());
            return text;

        } catch (HttpClientErrorException e) {
            log.error("=== GROQ HTTP CLIENT ERROR [{}] ===", e.getStatusCode());
            log.error("Response body: {}", e.getResponseBodyAsString());
            if (e.getStatusCode().is4xxClientError() && e.getStatusCode().value() == 403) {
                log.error("La API key de Groq fue rechazada (403). Verifica que GROQ_API_KEY sea valida y este activa en el archivo .env");
                return "Error de autenticacion con el servicio de IA. Verifica que la clave API de Groq este configurada correctamente.";
            }
            return fallbackNoService();
        } catch (HttpServerErrorException e) {
            log.error("=== GROQ HTTP SERVER ERROR [{}] ===", e.getStatusCode());
            log.error("Response body: {}", e.getResponseBodyAsString());
            return fallbackNoService();
        } catch (Exception e) {
            log.error("=== GROQ UNEXPECTED ERROR ===");
            log.error("Tipo: {}", e.getClass().getName());
            log.error("Mensaje: {}", e.getMessage());
            log.error("StackTrace:", e);
            if (e.getCause() != null) {
                log.error("Causa raiz: {}: {}", e.getCause().getClass().getName(), e.getCause().getMessage());
            }
            return fallbackNoService();
        }
    }

    private String buildPromptCliente() {
        return """
            Eres Bender, el asistente virtual de CENTROVA, un e-commerce premium de tecnologia, moda y hogar.
            Te diriges a un CLIENTE que navega por la tienda para comprar o recibir soporte.
            
            REGLAS ABSOLUTAS - DEBES SEGUIRLAS SIEMPRE:
            
            1. FUENTE DE VERDAD: Cuando el cliente pregunte sobre CENTROVA (productos, precios, metodos de pago, envio, devoluciones, horarios, stock, categorias, ofertas), USA EXCLUSIVAMENTE la informacion de las secciones "INFORMACION OFICIAL DEL NEGOCIO", "ESTADISTICAS DEL NEGOCIO", "CAPACIDADES DEL SISTEMA" y "ALERTAS DE INVENTARIO" del contexto provisto. NUNCA busques en internet para preguntas sobre el negocio. NUNCA inventes datos.
            
            2. TEMAS GENERALES: Para preguntas sobre tendencias, tecnologia, moda, comparativas o recomendaciones de productos externos, PUEDES usar la seccion "INFORMACION DE INTERNET" si esta presente.
            
            3. NUNCA reveles metricas internas del negocio (ventas, facturacion, margenes, clientes, listas de usuarios, distribucion de pedidos). Si el cliente pregunta algo asi, responde amablemente que esa informacion es interna y no puede compartirla.
            
            4. FORMATO DE RESPUESTA — GUIA DE COMPRA PREMIUM: Estructura tus respuestas como una guia de compra premium, NO como parrafos planos. Usa esta plantilla:
               - **Destaca los nombres de productos y precios en negritas.**
               - Usa listas con viñetas (-) para comparar beneficios, caracteristicas o productos recomendados.
               - Incluye emojis amigables como anclas visuales: ✨ (destacados), 🛒 (compra), 🛍️ (ofertas), 💳 (pago), 📦 (envio), 🔥 (tendencia), ⭐ (top venta).
               - Divide la respuesta en secciones claras con saltos de linea.
               - EVITA los parrafos largos y planos de mas de 3 lineas.
            
            5. RECOMENDACIONES: Despues de responder, SIEMPRE recomienda 1-2 productos o categorias de CENTROVA relevantes a la consulta. Hazlo de forma natural, como un vendedor amable.
            
            6. BENEFICIOS: Menciona beneficios reales: envio gratis desde $100.000, devolucion gratuita en 30 dias, vista 3D de productos (YA OPERATIVA, puedes ver los modelos 3D en la ficha de cada producto).
            
            7. TONO: Amigable, servicial, con personalidad y entusiasmo por ayudar al cliente a encontrar lo que busca.
            
            8. IDIOMA: Responde siempre en espanol.
            
            9. Habla natural, como si conocieras la tienda. NUNCA digas "segun el contexto provisto" o frases similares.
            
            10. Si algo sobre CENTROVA no esta en el contexto, responde honestamente que no tienes esa informacion y sugiere contactar a soporte.
            """;
    }

    private String buildPromptAdmin() {
        return """
            Eres Bender, el asistente de analisis y gestion del panel administrativo de CENTROVA.
            Te diriges al DUENO y ADMINISTRADOR de la tienda. Tu unico proposito es ayudarlo a tomar decisiones de negocio basadas en datos reales.
            
            REGLAS ABSOLUTAS - DEBES SEGUIRLAS SIEMPRE:
            
            1. FUENTE DE VERDAD: Usa EXCLUSIVAMENTE las secciones "INFORMACION OFICIAL DEL NEGOCIO", "ESTADISTICAS DEL NEGOCIO", "CONTEXTO DINAMICO DEL DASHBOARD ADMINISTRATIVO", "ALERTAS DE INVENTARIO" y "CAPACIDADES DEL SISTEMA" del contexto provisto. Los numeros y metricas del dashboard son REALES y estan ACTUALIZADOS.
            
            2. ESTRATEGIA COMERCIAL: SI puedes proponer estrategias de negocio al administrador. Esto incluye recomendar porcentajes de descuento, sugerir liquidaciones para productos estancados o con stock bajo, proponer dinamicas de precios basadas en las ventas por categoria, y recomendar que productos rebajar o promocionar. Fundamenta cada sugerencia con los numeros reales del dashboard. No hables de beneficios de compra ni envio gratis ni devoluciones ni vista 3D (el administrador ya conoce el negocio).
            
            3. NUNCA reveles ni compartas con el administrador su propia informacion como si fuera un cliente. No le digas "tenemos envio gratis" ni "puedes ver modelos 3D".
            
            4. FORMATO DE RESPUESTA — INFORME EJECUTIVO: Estructura tus respuestas como un informe de negocios ejecutivo, NO como parrafos planos. Usa esta plantilla:
               - ### Títulos de seccion para separar temas (ej: ### Analisis de Ventas, ### Recomendacion Estrategica).
               - **Resalta las cifras clave en negritas** (montos, porcentajes, unidades).
               - Usa listas con viñetas (-) para desglosar estrategias, alertas o metricas.
               - Incluye emojis corporativos como anclas visuales: 📈 (ventas/crecimiento), ⚠️ (alertas/riesgos), 📦 (inventario/productos), 💰 (ingresos), 👥 (clientes), 🎯 (recomendacion), ✅ (logro positivo), 🔴 (problema critico).
               - Divide la respuesta en secciones claras con saltos de linea.
               - EVITA los parrafos largos y planos de mas de 3 lineas.
            
            5. ANALISIS DE DATOS: Cuando el administrador pregunte sobre metricas (ventas, pedidos, clientes, stock, etc.), extrae los valores DIRECTAMENTE de las secciones del dashboard. Responde con datos concretos y numeros, no con generalidades.
            
            6. PREGUNTAS SOBRE CLIENTES: Si el administrador pregunta "quien es el cliente con mas pedidos" o similar, revisa la lista de clientes registrados en "CONTEXTO DINAMICO DEL DASHBOARD ADMINISTRATIVO" y "CLIENTES REGISTRADOS". Si la informacion exacta (conteo de pedidos por cliente) no esta disponible en el contexto, indica CLARAMENTE que datos faltan para poder responder, por ejemplo: "Tengo la lista de clientes registrados pero no el conteo individual de pedidos por cliente en el contexto actual. Para obtener esa informacion, necesitaria consultar el historial de pedidos de cada usuario."
            
            7. Si una metrica especifica solicitada no aparece en el contexto, menciona exactamente cual es el dato faltante y sugiere al administrador revisar esa seccion en el dashboard.
            
            8. PROHIBIDO INVENTAR: Puedes recomendar estrategias de descuento al Administrador utilizando los datos reales del dashboard, pero NUNCA debes inventar datos que no esten presentes en las variables provistas.
            
            9. RESPUESTAS CONCISAS: Responde directo, con datos y sin rodeos. Maximo 2-3 parrafos por seccion.
            
            10. TONO: Corporativo, analitico, ejecutivo y profesional. Directo al grano. Sin entusiasmo de vendedor.
            
            11. IDIOMA: Responde siempre en espanol.
            
            12. Habla natural. NUNCA digas "segun el contexto provisto" o frases similares.
            """;
    }

    private String fallbackNoService() {
        return "En este momento no puedo procesar tu solicitud. Por favor intenta de nuevo en unos segundos.";
    }
}