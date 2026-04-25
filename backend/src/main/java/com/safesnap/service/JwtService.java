package com.safesnap.service;

import com.safesnap.config.JwtProperties;
import com.safesnap.exception.UnauthorizedException;
import io.jsonwebtoken.*;
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

    private static final String CLAIM_ROLE           = "role";
    private static final String ROLE_PARENT          = "PARENT";
    private static final String ROLE_CHILD           = "CHILD";
    private static final String REDIS_REFRESH_PREFIX = "refresh:";
    private static final String REDIS_REVOKED_PREFIX = "revoked:";

    private final JwtProperties        jwtProperties;
    private final StringRedisTemplate  redisTemplate;

    public String generateAccessToken(UUID subjectId, String role) {
        Instant now    = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.accessTokenExpiryMinutes() * 60L);
        return buildToken(subjectId.toString(), role, now, expiry);
    }

    public String generateParentAccessToken(UUID parentId) {
        return generateAccessToken(parentId, ROLE_PARENT);
    }

    public String generateChildAccessToken(UUID childId) {
        return generateAccessToken(childId, ROLE_CHILD);
    }

    /**
     * Stores the refresh token in Redis. If Redis is unavailable the token is
     * still returned — revocation simply won't be enforced until Redis recovers.
     */
    public String generateRefreshToken(UUID subjectId) {
        String   token = UUID.randomUUID().toString();
        Duration ttl   = Duration.ofDays(jwtProperties.refreshTokenExpiryDays());
        try {
            redisTemplate.opsForValue().set(REDIS_REFRESH_PREFIX + token, subjectId.toString(), ttl);
            log.debug("Stored refresh token for subject {}", subjectId);
        } catch (Exception e) {
            log.warn("Redis unavailable — refresh token not persisted (revocation disabled): {}", e.getMessage());
        }
        return token;
    }

    public Claims validateAccessToken(String token) {
        try {
            Claims claims = parseToken(token);
            String jti    = claims.getId();
            if (jti != null && isRevoked(jti)) {
                throw new UnauthorizedException("Token has been revoked");
            }
            return claims;
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (ExpiredJwtException ex) {
            throw new UnauthorizedException("Token has expired");
        } catch (JwtException ex) {
            log.warn("JWT validation failed: {}", ex.getMessage());
            throw new UnauthorizedException("Invalid token");
        }
    }

    /**
     * Resolves a refresh token from Redis. If Redis is down the token cannot be
     * validated — the client must re-authenticate.
     */
    public UUID resolveRefreshToken(String refreshToken) {
        try {
            String key   = REDIS_REFRESH_PREFIX + refreshToken;
            String value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                throw new UnauthorizedException("Refresh token not found or expired");
            }
            redisTemplate.delete(key);
            return UUID.fromString(value);
        } catch (UnauthorizedException ex) {
            throw ex;
        } catch (Exception e) {
            log.warn("Redis unavailable during refresh token resolution: {}", e.getMessage());
            throw new UnauthorizedException("Token service temporarily unavailable — please sign in again");
        }
    }

    public void revokeAccessToken(String jti, Instant expiry) {
        Duration remaining = Duration.between(Instant.now(), expiry);
        if (remaining.isNegative()) return;
        try {
            redisTemplate.opsForValue().set(REDIS_REVOKED_PREFIX + jti, "1", remaining);
        } catch (Exception e) {
            log.warn("Redis unavailable — access token revocation skipped for jti={}: {}", jti, e.getMessage());
        }
    }

    public long accessTokenExpirySeconds() {
        return jwtProperties.accessTokenExpiryMinutes() * 60L;
    }

    public long refreshTokenExpirySeconds() {
        return jwtProperties.refreshTokenExpiryDays() * 86400L;
    }

    // ─────────────────────────────────────────────────────────────────────────

    private boolean isRevoked(String jti) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(REDIS_REVOKED_PREFIX + jti));
        } catch (Exception e) {
            log.warn("Redis unavailable — skipping revocation check for jti={}: {}", jti, e.getMessage());
            return false;
        }
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
        byte[] key32    = new byte[32];
        System.arraycopy(keyBytes, 0, key32, 0, Math.min(keyBytes.length, 32));
        return Keys.hmacShaKeyFor(key32);
    }
}
