package com.safesnap.dto.request;

import com.safesnap.model.Alert.Severity;
import jakarta.validation.constraints.*;

import java.time.Instant;

/**
 * Metadata-only payload from the child device.
 * No image bytes are ever sent to this server — the imageHash is a
 * SHA-256 hex digest computed on-device before the image is discarded.
 */
public record ReportAlertRequest(

    @NotBlank(message = "Child device ID is required")
    String childDeviceId,

    @NotNull(message = "Timestamp is required")
    Instant timestamp,

    @NotNull(message = "Severity score is required")
    @DecimalMin(value = "0.0", message = "Severity score must be >= 0.0")
    @DecimalMax(value = "1.0", message = "Severity score must be <= 1.0")
    Double severityScore,

    /**
     * SHA-256 hex string — exactly 64 hex characters.
     */
    @NotBlank(message = "Image hash is required")
    @Pattern(
        regexp = "^[a-fA-F0-9]{64}$",
        message = "imageHash must be a 64-character SHA-256 hex string"
    )
    String imageHash,

    @NotNull(message = "Severity level is required")
    Severity severity
) {}
