package com.safesnap.service;

import com.safesnap.dto.request.AcknowledgeAlertRequest;
import com.safesnap.dto.request.ReportAlertRequest;
import com.safesnap.dto.response.AlertResponse;
import com.safesnap.exception.ResourceNotFoundException;
import com.safesnap.exception.UnauthorizedException;
import com.safesnap.model.Alert;
import com.safesnap.model.Child;
import com.safesnap.repository.AlertRepository;
import com.safesnap.repository.ChildRepository;
import com.safesnap.websocket.AlertWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlertService {

    private final AlertRepository       alertRepository;
    private final ChildRepository       childRepository;
    private final AlertWebSocketHandler webSocketHandler;

    /**
     * Persists alert metadata reported by a child device and pushes a real-time
     * notification to the parent's open WebSocket sessions.
     */
    @Transactional
    public AlertResponse reportAlert(ReportAlertRequest request) {
        Child child = childRepository.findByDeviceId(request.childDeviceId())
            .orElseThrow(() -> new ResourceNotFoundException("Child device", request.childDeviceId()));

        Alert alert = Alert.builder()
            .child(child)
            .timestamp(request.timestamp())
            .severityScore(request.severityScore())
            .imageHash(request.imageHash())
            .severity(request.severity())
            .build();
        alert = alertRepository.save(alert);
        log.info("Alert saved id={} childId={} severity={}", alert.getId(), child.getId(), alert.getSeverity());

        AlertResponse response = AlertResponse.from(alert);
        UUID parentId = child.getParent().getId();
        webSocketHandler.broadcastToParent(parentId, response);
        return response;
    }

    @Transactional(readOnly = true)
    public Page<AlertResponse> listAlertsForParent(UUID parentId, Pageable pageable) {
        return alertRepository
            .findByParentIdOrderByTimestampDesc(parentId, pageable)
            .map(AlertResponse::from);
    }

    @Transactional
    public AlertResponse acknowledgeAlert(UUID parentId, AcknowledgeAlertRequest request) {
        Alert alert = alertRepository.findById(request.alertId())
            .orElseThrow(() -> new ResourceNotFoundException("Alert", request.alertId()));

        UUID alertParentId = alert.getChild().getParent().getId();
        if (!alertParentId.equals(parentId)) {
            throw new UnauthorizedException("Alert does not belong to the authenticated parent");
        }
        if (alert.isAcknowledged()) {
            return AlertResponse.from(alert); // idempotent
        }
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(Instant.now());
        alert = alertRepository.save(alert);
        log.debug("Alert id={} acknowledged by parentId={}", alert.getId(), parentId);
        return AlertResponse.from(alert);
    }
}
