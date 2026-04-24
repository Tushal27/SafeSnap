package com.safesnap.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.safesnap.model.Alert;
import com.safesnap.model.Alert.Severity;

import java.time.Instant;
import java.util.UUID;

public record AlertResponse(
    UUID id,
    UUID childId,
    String childDeviceName,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant timestamp,
    Double severityScore,
    String imageHash,
    Severity severity,
    boolean acknowledged,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant acknowledgedAt
) {
    public static AlertResponse from(Alert alert) {
        return new AlertResponse(
            alert.getId(),
            alert.getChild().getId(),
            alert.getChild().getDeviceName(),
            alert.getTimestamp(),
            alert.getSeverityScore(),
            alert.getImageHash(),
            alert.getSeverity(),
            alert.isAcknowledged(),
            alert.getAcknowledgedAt()
        );
    }
}
