package com.safesnap.dto.response;

/**
 * Returned from POST /api/v1/auth/pair-child.
 * The QR code image is Base64-encoded PNG so the dashboard can render it inline.
 */
public record PairChildResponse(
    String pairingToken,
    String qrCodeBase64,
    long tokenTtlSeconds
) {}
