package com.safesnap.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safesnap.dto.response.AlertResponse;
import com.safesnap.service.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.UUID;

/**
 * Handles the persistent WebSocket connection from parent dashboards.
 *
 * <p>Handshake authentication: the client must supply a valid JWT in the
 * {@code Authorization} query parameter, e.g.:
 * {@code ws://host/ws/alerts?token=<accessToken>}
 *
 * <p>After connection, the server only pushes {@link AlertResponse} JSON.
 * Incoming text frames are ignored.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AlertWebSocketHandler extends TextWebSocketHandler {

    private static final String TOKEN_PARAM      = "token";
    private static final String ATTR_PARENT_ID   = "parentId";

    private final JwtService              jwtService;
    private final WebSocketSessionRegistry registry;
    private final ObjectMapper             objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        UUID parentId = authenticate(session);
        session.getAttributes().put(ATTR_PARENT_ID, parentId);
        registry.register(parentId, session);
        log.info("WS connected: session={} parentId={}", session.getId(), parentId);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        // Client-to-server messages are not part of this protocol; silently ignore.
        log.trace("Ignoring inbound WS frame from session={}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        registry.deregister(session);
        log.info("WS disconnected: session={} status={}", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("WS transport error on session={}: {}", session.getId(), exception.getMessage());
        registry.deregister(session);
    }

    /**
     * Broadcasts an alert to all open sessions belonging to the alert's parent.
     */
    public void broadcastToParent(UUID parentId, AlertResponse alert) {
        if (!registry.hasSessions(parentId)) {
            log.debug("No active WS sessions for parentId={}, skipping broadcast", parentId);
            return;
        }
        String payload = serialize(alert);
        registry.getSessions(parentId).forEach(session -> sendSafely(session, payload));
    }

    private UUID authenticate(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        String token = extractTokenFromQuery(query);
        if (token == null || token.isBlank()) {
            closeUnauthorized(session);
            throw new IllegalStateException("Missing WS auth token for session=" + session.getId());
        }
        Claims claims = jwtService.validateAccessToken(token);
        return UUID.fromString(claims.getSubject());
    }

    private String extractTokenFromQuery(String query) {
        if (query == null) {
            return null;
        }
        for (String param : query.split("&")) {
            String[] kv = param.split("=", 2);
            if (kv.length == 2 && TOKEN_PARAM.equals(kv[0])) {
                return kv[1];
            }
        }
        return null;
    }

    private void sendSafely(WebSocketSession session, String payload) {
        try {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(payload));
            }
        } catch (IOException ex) {
            log.warn("Failed to send WS message to session={}: {}", session.getId(), ex.getMessage());
        }
    }

    private String serialize(AlertResponse alert) {
        try {
            return objectMapper.writeValueAsString(alert);
        } catch (IOException ex) {
            log.error("Failed to serialize AlertResponse", ex);
            return "{}";
        }
    }

    private void closeUnauthorized(WebSocketSession session) {
        try {
            session.close(CloseStatus.POLICY_VIOLATION);
        } catch (IOException ex) {
            log.warn("Could not close unauthorized WS session={}", session.getId());
        }
    }
}
