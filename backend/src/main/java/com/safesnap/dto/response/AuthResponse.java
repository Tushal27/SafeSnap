package com.safesnap.dto.response;

import java.util.UUID;

public record AuthResponse(
    UUID parentId,
    String accessToken,
    String refreshToken,
    long accessTokenExpiresInSeconds,
    long refreshTokenExpiresInSeconds
) {}
