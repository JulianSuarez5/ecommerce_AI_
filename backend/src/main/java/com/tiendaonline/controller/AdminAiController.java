package com.tiendaonline.controller;

import com.tiendaonline.dto.response.DashboardMetricasResponse;
import com.tiendaonline.dto.response.UsuarioResponse;
import com.tiendaonline.service.AdminDashboardService;
import com.tiendaonline.service.AdminUserService;
import com.tiendaonline.service.AiRole;
import com.tiendaonline.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/ai/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAiController {

    private final AiService aiService;
    private final AdminDashboardService adminDashboardService;
    private final AdminUserService adminUserService;

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        if (question == null || question.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "question is required"));
        }

        String adminContext = construirContextoAdmin();
        String response = aiService.chatConRol(question, adminContext, AiRole.ADMINISTRADOR);
        return ResponseEntity.ok(Map.of("response", response));
    }

    private String construirContextoAdmin() {
        DashboardMetricasResponse metricas = adminDashboardService.obtenerMetricas();
        List<UsuarioResponse> usuarios = adminUserService.listarUsuarios();

        StringBuilder ctx = new StringBuilder();
        ctx.append("=== CONTEXTO DINAMICO DEL DASHBOARD ADMINISTRATIVO ===\n");

        ctx.append(String.format("""
            METRICAS PRINCIPALES:
            - Ventas del mes: $%s (variacion: %.1f%% respecto al mes anterior)
            - Pedidos del mes: %d (variacion: %.1f%%)
            - Pedidos pendientes de confirmacion: %d
            - Clientes activos: %d
            - Nuevos clientes este mes: %d
            - Productos agotados: %d
            - Productos con stock bajo: %d
            """,
            metricas.getVentasMes().toPlainString(),
            metricas.getCambioVentas(),
            metricas.getPedidosMes(),
            metricas.getCambioPedidos(),
            metricas.getPedidosPendientes(),
            metricas.getClientesActivos(),
            metricas.getNuevosClientesMes(),
            metricas.getProductosAgotados(),
            metricas.getStockBajo()
        ));

        if (metricas.getVentasCategoria() != null && !metricas.getVentasCategoria().isEmpty()) {
            ctx.append("\nVENTAS POR CATEGORIA:\n");
            for (var cat : metricas.getVentasCategoria()) {
                ctx.append(String.format("- %s: $%s\n", cat.getNombre(), cat.getTotal().toPlainString()));
            }
        }

        if (metricas.getDistribucionEstados() != null && !metricas.getDistribucionEstados().isEmpty()) {
            ctx.append("\nDISTRIBUCION DE PEDIDOS POR ESTADO:\n");
            for (var est : metricas.getDistribucionEstados()) {
                ctx.append(String.format("- %s: %d pedidos\n", est.getEstado(), est.getCantidad()));
            }
        }

        ctx.append("\n" + adminDashboardService.obtenerClientesConPedidos() + "\n");

        ctx.append("\n=== CLIENTES REGISTRADOS ===\n");
        String usuariosStr = usuarios.stream()
            .limit(20)
            .map(u -> String.format("- %s %s (%s) [ID: %d, Registro: %s]",
                u.getNombre(), u.getApellido(), u.getEmail(), u.getId(),
                u.getFechaRegistro() != null ? u.getFechaRegistro().toLocalDate().toString() : "N/A"))
            .collect(Collectors.joining("\n"));

        ctx.append(usuariosStr);
        if (usuarios.size() > 20) {
            ctx.append(String.format("\n... y %d clientes mas", usuarios.size() - 20));
        }

        return ctx.toString();
    }
}
