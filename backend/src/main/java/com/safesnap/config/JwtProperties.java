package com.safesnap.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@ConfigurationProperties(prefix = "safesnap.jwt")
@Validated
public record JwtProperties(

    @NotBlank
    @Size(min = 32, message = "JWT secret must be at least 32 characters")
    String secret,

    @Min(1)
    long accessTokenExpiryMinutes,

    @Min(1)
    long refreshTokenExpiryDays
) {}
