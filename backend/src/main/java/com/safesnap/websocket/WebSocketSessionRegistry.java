package com.safesnap.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe registry that maps a parentId to the set of open WebSocket sessions
 * belonging to that parent's dashboard tabs/windows.
 */
@Slf4j
@Component
public class WebSocketSessionRegistry {

    // parentId → set of active sessions
    private final Map<UUID, Set<WebSocketSession>> sessionsByParent = new ConcurrentHashMap<>();

    // sessionId → parentId (reverse lookup for clean removal on disconnect)
    private final Map<String, UUID> parentBySession = new ConcurrentHashMap<>();

    public void register(UUID parentId, WebSocketSession session) {
        sessionsByParent
            .computeIfAbsent(parentId, id -> Collections.synchronizedSet(new HashSet<>()))
            .add(session);
        parentBySession.put(session.getId(), parentId);
        log.debug("Registered WS session {} for parentId={}", session.getId(), parentId);
    }

    public void deregister(WebSocketSession session) {
        UUID parentId = parentBySession.remove(session.getId());
        if (parentId != null) {
            Set<WebSocketSession> sessions = sessionsByParent.get(parentId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    sessionsByParent.remove(parentId);
                }
            }
            log.debug("Deregistered WS session {} for parentId={}", session.getId(), parentId);
        }
    }

    /**
     * Returns a snapshot of open sessions for the given parent.
     * Callers receive a copy; mutations do not affect the registry.
     */
    public Set<WebSocketSession> getSessions(UUID parentId) {
        Set<WebSocketSession> sessions = sessionsByParent.get(parentId);
        if (sessions == null) {
            return Set.of();
        }
        synchronized (sessions) {
            return Set.copyOf(sessions);
        }
    }

    public boolean hasSessions(UUID parentId) {
        Set<WebSocketSession> sessions = sessionsByParent.get(parentId);
        return sessions != null && !sessions.isEmpty();
    }
}
