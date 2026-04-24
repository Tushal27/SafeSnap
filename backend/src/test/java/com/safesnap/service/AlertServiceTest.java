package com.safesnap.service;

import com.safesnap.dto.request.ReportAlertRequest;
import com.safesnap.dto.response.AlertResponse;
import com.safesnap.exception.ResourceNotFoundException;
import com.safesnap.model.Alert;
import com.safesnap.model.Alert.Severity;
import com.safesnap.model.Child;
import com.safesnap.model.Parent;
import com.safesnap.repository.AlertRepository;
import com.safesnap.repository.ChildRepository;
import com.safesnap.websocket.AlertWebSocketHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock private AlertRepository       alertRepository;
    @Mock private ChildRepository       childRepository;
    @Mock private AlertWebSocketHandler webSocketHandler;

    @Captor private ArgumentCaptor<Alert> alertCaptor;
    @Captor private ArgumentCaptor<UUID>  parentIdCaptor;

    private AlertService alertService;

    private Parent testParent;
    private Child  testChild;

    @BeforeEach
    void setUp() {
        alertService = new AlertService(alertRepository, childRepository, webSocketHandler);

        testParent = Parent.builder()
            .id(UUID.randomUUID())
            .email("parent@example.com")
            .passwordHash("hash")
            .build();

        testChild = Child.builder()
            .id(UUID.randomUUID())
            .deviceId("device-abc-123")
            .deviceName("Child's Phone")
            .parent(testParent)
            .build();
    }

    @Test
    @DisplayName("reportAlert persists the alert with correct fields from the request")
    void reportAlert_savesAlertWithCorrectFields() {
        String imageHash   = "a".repeat(64);
        Instant timestamp  = Instant.now();
        ReportAlertRequest request = new ReportAlertRequest(
            testChild.getDeviceId(), timestamp, 0.85, imageHash, Severity.HIGH
        );

        when(childRepository.findByDeviceId(testChild.getDeviceId())).thenReturn(Optional.of(testChild));
        when(alertRepository.save(any(Alert.class))).thenAnswer(inv -> {
            Alert a = inv.getArgument(0);
            return Alert.builder()
                .id(UUID.randomUUID())
                .child(a.getChild())
                .timestamp(a.getTimestamp())
                .severityScore(a.getSeverityScore())
                .imageHash(a.getImageHash())
                .severity(a.getSeverity())
                .build();
        });

        AlertResponse response = alertService.reportAlert(request);

        verify(alertRepository).save(alertCaptor.capture());
        Alert saved = alertCaptor.getValue();
        assertThat(saved.getSeverityScore()).isEqualTo(0.85);
        assertThat(saved.getImageHash()).isEqualTo(imageHash);
        assertThat(saved.getSeverity()).isEqualTo(Severity.HIGH);
        assertThat(saved.getChild()).isEqualTo(testChild);
        assertThat(response.severity()).isEqualTo(Severity.HIGH);
    }

    @Test
    @DisplayName("reportAlert broadcasts the saved alert to the parent via WebSocket")
    void reportAlert_broadcastsToParentWebSocket() {
        ReportAlertRequest request = new ReportAlertRequest(
            testChild.getDeviceId(), Instant.now(), 0.5,
            "b".repeat(64), Severity.MEDIUM
        );

        when(childRepository.findByDeviceId(testChild.getDeviceId())).thenReturn(Optional.of(testChild));
        when(alertRepository.save(any())).thenAnswer(inv -> {
            Alert a = inv.getArgument(0);
            return Alert.builder().id(UUID.randomUUID()).child(a.getChild())
                .timestamp(a.getTimestamp()).severityScore(a.getSeverityScore())
                .imageHash(a.getImageHash()).severity(a.getSeverity()).build();
        });

        alertService.reportAlert(request);

        verify(webSocketHandler).broadcastToParent(
            eq(testParent.getId()),
            any(AlertResponse.class)
        );
    }

    @Test
    @DisplayName("reportAlert throws ResourceNotFoundException when device ID is unknown")
    void reportAlert_throwsWhenDeviceNotFound() {
        ReportAlertRequest request = new ReportAlertRequest(
            "unknown-device", Instant.now(), 0.3, "c".repeat(64), Severity.LOW
        );
        when(childRepository.findByDeviceId("unknown-device")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> alertService.reportAlert(request))
            .isInstanceOf(ResourceNotFoundException.class);

        verify(alertRepository, never()).save(any());
        verify(webSocketHandler, never()).broadcastToParent(any(), any());
    }

    @Test
    @DisplayName("acknowledgeAlert is idempotent — second call returns same response")
    void acknowledgeAlert_isIdempotent() {
        Alert alreadyAcked = Alert.builder()
            .id(UUID.randomUUID())
            .child(testChild)
            .timestamp(Instant.now())
            .severityScore(0.9)
            .imageHash("d".repeat(64))
            .severity(Severity.CRITICAL)
            .acknowledged(true)
            .acknowledgedAt(Instant.now().minusSeconds(60))
            .build();

        when(alertRepository.findById(alreadyAcked.getId())).thenReturn(Optional.of(alreadyAcked));

        AlertResponse response = alertService.acknowledgeAlert(
            testParent.getId(),
            new com.safesnap.dto.request.AcknowledgeAlertRequest(alreadyAcked.getId())
        );

        assertThat(response.acknowledged()).isTrue();
        verify(alertRepository, never()).save(any()); // no redundant save
    }
}
