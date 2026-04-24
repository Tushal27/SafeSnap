package com.safesnap.service;

import com.safesnap.config.JwtProperties;
import com.safesnap.exception.UnauthorizedException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String CLAIM_ROLE      = "role";
    private static final String ROLE_PARENT     = "PARENT";
    private static final String ROLE_CHILD      = "CHILD";
    private static final String REDIS_REFRESH_PREFIX = "refresh:";
    private static final String REDIS_REVOKED_PREFIX = "revoked:";

    private final JwtProperties jwtProperties;
    private final StringRedisTemplate redisTemplate;

    public String generateAccessToken(UUID subjectId, String role) {
        Instant now    = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.accessTokenExpiryMinutes() * 60);
        return buildToken(subjectId.toString(), role, now, expiry);
    }

    public String generateRefreshToken(UUID subjectId) {
        String token   = UUID.randomUUID().toString();
        Duration ttl   = Duration.ofDays(jwtProperties.refreshTokenExpiryDays());
        String key     = REDIS_REFRESH_PREFIX + token;
        redisTemplate.opsForValue().set(key, subjectId.toString(), ttl);
        log.debug("Stored refresh token for subject {}", subjectId);
        return token;
    }

    public String generateParentAccessToken(UUID parentId) {
        return generateAccessToken(parentId, ROLE_PARENT);
    }

    public String generateChildAccessToken(UUID childId) {
        return generateAccessToken(childId, ROLE_CHILD);
    }

    public Claims validateAccessToken(String token) {
        try {
            Claims claims = parseToken(token);
            String jti    = claims.getId();
            if (jti != null && Boolean.TRUE.equals(redisTemplate.hasKey(REDIS_REVOKED_PREFIX + jti))) {
                throw new UnauthorizedException("Token has been revoked");
            }
            return claims;
        } catch (ExpiredJwtException ex) {
            throw new UnauthorizedException("Token has expired");
        } catch (JwtException ex) {
            log.warn("JWT validation failed: {}", ex.getMessage());
            throw new UnauthorizedException("Invalid token");
        }
    }

    public UUID resolveRefreshToken(String refreshToken) {
        String key   = REDIS_REFRESH_PREFIX + refreshToken;
        String value = redisTemplate.opsForValue().get(key);
        if (value == null) {
            throw new UnauthorizedException("Refresh token not found or expired");
        }
        redisTemplate.delete(key); // rotate: one-time use
        return UUID.fromString(value);
    }

    public void revokeAccessToken(String jti, Instant expiry) {
        Duration remaining = Duration.between(Instant.now(), expiry);
        if (!remaining.isNegative()) {
            redisTemplate.opsForValue().set(REDIS_REVOKED_PREFIX + jti, "1", remaining);
        }
    }

    public long accessTokenExpirySeconds() {
        return jwtProperties.accessTokenExpiryMinutes() * 60;
    }

    public long refreshTokenExpirySeconds() {
        return jwtProperties.refreshTokenExpiryDays() * 86400;
    }

    private String buildToken(String subject, String role, Instant issuedAt, Instant expiry) {
        return Jwts.builder()
            .id(UUID.randomUUID().toString())
            .subject(subject)
            .claim(CLAIM_ROLE, role)
            .issuedAt(Date.from(issuedAt))
            .expiration(Date.from(expiry))
            .signWith(signingKey())
            .compact();
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
            .verifyWith(signingKey())
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }

    private SecretKey signingKey() {
        byte[] keyBytes = jwtProperties.secret().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        // Pad or truncate to exactly 32 bytes for HS256
        byte[] key32 = new byte[32];
        System.arraycopy(keyBytes, 0, key32, 0, Math.min(keyBytes.length, 32));
        return Keys.hmacShaKeyFor(key32);
    }
}
