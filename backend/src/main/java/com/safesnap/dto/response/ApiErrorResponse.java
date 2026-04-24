package com.safesnap.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.Instant;

public record ApiErrorResponse(
    int status,
    String message,
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    Instant timestamp,
    String path
) {
    public static ApiErrorResponse of(int status, String message, String path) {
        return new ApiErrorResponse(status, message, Instant.now(), path);
    }
}
