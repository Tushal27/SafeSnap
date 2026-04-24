package com.safesnap.config;

import com.safesnap.constants.ApiRoutes;
import com.safesnap.websocket.AlertWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final AlertWebSocketHandler alertWebSocketHandler;
    private final CorsProperties        corsProperties;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry
            .addHandler(alertWebSocketHandler, ApiRoutes.WS_ALERTS)
            .setAllowedOrigins(corsProperties.allowedOrigins().toArray(String[]::new));
    }
}
