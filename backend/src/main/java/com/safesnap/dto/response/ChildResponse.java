package com.safesnap.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.safesnap.model.Child;

import java.time.Instant;
import java.util.UUID;

public record ChildResponse(
    UUID id,
    String deviceName,
    String deviceId,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant pairedAt,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant lastSeenAt,
    boolean isOnline
) {
    public static ChildResponse from(Child child) {
        return new ChildResponse(
            child.getId(),
            child.getDeviceName(),
            child.getDeviceId(),
            child.getPairedAt(),
            child.getLastSeenAt(),
            child.isOnline()
        );
    }
}
