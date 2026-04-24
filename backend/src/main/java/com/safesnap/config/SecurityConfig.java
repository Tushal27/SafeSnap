package com.safesnap.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safesnap.constants.ApiRoutes;
import com.safesnap.dto.response.ApiErrorResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;
    private final ObjectMapper            objectMapper;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public auth endpoints
                .requestMatchers(HttpMethod.POST,
                    ApiRoutes.AUTH_BASE + ApiRoutes.AUTH_REGISTER_PARENT,
                    ApiRoutes.AUTH_BASE + ApiRoutes.AUTH_LOGIN,
                    ApiRoutes.AUTH_BASE + ApiRoutes.AUTH_PAIR_CHILD
                ).permitAll()
                // WebSocket upgrade — token auth is handled by the handler itself
                .requestMatchers(ApiRoutes.WS_ALERTS).permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint(this::handleUnauthorized)
                .accessDeniedHandler(this::handleForbidden)
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    private void handleUnauthorized(
        jakarta.servlet.http.HttpServletRequest req,
        HttpServletResponse res,
        org.springframework.security.core.AuthenticationException ex
    ) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorResponse body = ApiErrorResponse.of(401, "Authentication required", req.getRequestURI());
        res.getWriter().write(objectMapper.writeValueAsString(body));
    }

    private void handleForbidden(
        jakarta.servlet.http.HttpServletRequest req,
        HttpServletResponse res,
        org.springframework.security.access.AccessDeniedException ex
    ) throws IOException {
        res.setStatus(HttpServletResponse.SC_FORBIDDEN);
        res.setContentType(MediaType.APPLICATION_JSON_VALUE);
        ApiErrorResponse body = ApiErrorResponse.of(403, "Access denied", req.getRequestURI());
        res.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
