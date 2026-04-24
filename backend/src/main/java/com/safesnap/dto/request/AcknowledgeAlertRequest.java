package com.safesnap.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AcknowledgeAlertRequest(

    @NotNull(message = "Alert ID is required")
    UUID alertId
) {}
