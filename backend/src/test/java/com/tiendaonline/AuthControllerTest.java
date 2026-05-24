package com.tiendaonline;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tiendaonline.dto.request.LoginRequest;
import com.tiendaonline.dto.request.RegistroRequest;
import com.tiendaonline.dto.response.AuthResponse;
import com.tiendaonline.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("AuthController - Pruebas de integración")
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @MockBean  AuthService authService;

    @Test
    @DisplayName("POST /auth/login retorna 200 con token válido")
    void login_credencialesValidas_retorna200() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("admin@tienda.com");
        req.setPassword("Admin123!");

        AuthResponse respuesta = AuthResponse.builder()
                .accessToken("token-jwt-test")
                .userId(1L)
                .nombre("Admin Sistema")
                .email("admin@tienda.com")
                .roles(Set.of("ROLE_ADMIN"))
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(respuesta);

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.email").value("admin@tienda.com"));
    }

    @Test
    @DisplayName("POST /auth/registro con campos vacíos retorna 400")
    void registro_camposVacios_retorna400() throws Exception {
        RegistroRequest req = new RegistroRequest(); // sin datos

        mockMvc.perform(post("/auth/registro")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.campos").exists());
    }

    @Test
    @DisplayName("POST /auth/login con email inválido retorna 400")
    void login_emailInvalido_retorna400() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("no-es-email");
        req.setPassword("clave");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
