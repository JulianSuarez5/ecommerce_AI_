package com.tiendaonline.service;

import com.tiendaonline.dto.request.LoginRequest;
import com.tiendaonline.dto.request.RegistroRequest;
import com.tiendaonline.dto.response.AuthResponse;
import com.tiendaonline.dto.response.UserInfoResponse;

public interface AuthService {
    AuthResponse login(LoginRequest request);
    AuthResponse registro(RegistroRequest request);
    AuthResponse refreshToken(String refreshToken);
    UserInfoResponse getCurrentUser(String email);
    void recuperarPassword(String email);
    void cambiarPassword(String token, String nuevaPassword);
}
