package com.safesnap.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;

@ConfigurationProperties(prefix = "safesnap.pairing")
@Validated
public record PairingProperties(

    @Min(60)
    long tokenTtlSeconds
) {}
