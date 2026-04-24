package com.safesnap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safesnap.config.JwtProperties;
import com.safesnap.dto.request.LoginRequest;
import com.safesnap.dto.request.RegisterParentRequest;
import com.safesnap.dto.response.AuthResponse;
import com.safesnap.exception.UnauthorizedException;
import com.safesnap.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static com.safesnap.constants.ApiRoutes.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
class AuthControllerTest {

    @Autowired private MockMvc     mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AuthService    authService;
    // WebMvcTest only loads the web layer; these beans are needed by SecurityConfig
    @MockBean private com.safesnap.service.JwtService jwtService;
    @MockBean private com.safesnap.config.JwtAuthenticationFilter jwtAuthFilter;
    @MockBean private com.safesnap.config.CorsProperties corsProperties;

    private static final String REGISTER_URL = AUTH_BASE + AUTH_REGISTER_PARENT;
    private static final String LOGIN_URL     = AUTH_BASE + AUTH_LOGIN;

    @Test
    @DisplayName("POST /register-parent returns 201 Created with tokens on success")
    void registerParent_returns201WithTokens() throws Exception {
        UUID parentId = UUID.randomUUID();
        AuthResponse stubResponse = new AuthResponse(parentId, "access-tok", "refresh-tok", 900, 604800);
        when(authService.registerParent(any())).thenReturn(stubResponse);

        RegisterParentRequest request = new RegisterParentRequest("alice@example.com", "Password123");

        mockMvc.perform(post(REGISTER_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.accessToken").value("access-tok"))
            .andExpect(jsonPath("$.refreshToken").value("refresh-tok"))
            .andExpect(jsonPath("$.parentId").value(parentId.toString()));
    }

    @Test
    @DisplayName("POST /register-parent returns 400 when email is invalid")
    void registerParent_returns400ForInvalidEmail() throws Exception {
        RegisterParentRequest request = new RegisterParentRequest("not-an-email", "Password123");

        mockMvc.perform(post(REGISTER_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /register-parent returns 400 when password is too short")
    void registerParent_returns400ForShortPassword() throws Exception {
        RegisterParentRequest request = new RegisterParentRequest("ok@example.com", "short");

        mockMvc.perform(post(REGISTER_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST /login returns 401 when service throws UnauthorizedException")
    void login_returns401ForBadCredentials() throws Exception {
        when(authService.login(any())).thenThrow(new UnauthorizedException("Invalid credentials"));

        LoginRequest request = new LoginRequest("hacker@example.com", "wrongpass");

        mockMvc.perform(post(LOGIN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status").value(401))
            .andExpect(jsonPath("$.message").value("Invalid credentials"));
    }

    @Test
    @DisplayName("POST /login returns 200 with tokens for valid credentials")
    void login_returns200WithTokensForValidCredentials() throws Exception {
        UUID parentId = UUID.randomUUID();
        AuthResponse stub = new AuthResponse(parentId, "acc", "ref", 900, 604800);
        when(authService.login(any())).thenReturn(stub);

        LoginRequest request = new LoginRequest("user@example.com", "correctPass1");

        mockMvc.perform(post(LOGIN_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").value("acc"));
    }
}
