package com.safesnap.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.safesnap.model.Alert.Severity;

import java.time.Instant;
import java.util.Map;

public record StatsResponse(
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant windowStart,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant windowEnd,
    long totalAlerts,
    Map<Severity, Long> alertsBySeverity,
    long unacknowledgedAlerts
) {}
