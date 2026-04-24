package com.safesnap.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PairChildRequest(

    @NotBlank(message = "Device name is required")
    @Size(max = 128, message = "Device name must not exceed 128 characters")
    String deviceName,

    /**
     * Unique identifier for the child's device (e.g. Android ID / iOS identifierForVendor).
     * The child app sends this when exchanging the pairing token for a JWT.
     */
    @NotBlank(message = "Device ID is required")
    @Size(max = 256, message = "Device ID must not exceed 256 characters")
    String deviceId
) {}
