package com.safesnap.service;

import com.safesnap.config.JwtProperties;
import com.safesnap.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private static final String SECRET = "test-secret-must-be-at-least-32-chars!!";
    private static final long   ACCESS_MINUTES  = 15;
    private static final long   REFRESH_DAYS    = 7;

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOps;

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties props = new JwtProperties(SECRET, ACCESS_MINUTES, REFRESH_DAYS);
        jwtService = new JwtService(props, redisTemplate);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
    }

    @Test
    @DisplayName("generateParentAccessToken returns a non-blank signed JWT")
    void generateParentAccessToken_returnsNonBlankJwt() {
        UUID parentId = UUID.randomUUID();
        String token  = jwtService.generateParentAccessToken(parentId);

        assertThat(token).isNotBlank();
        // JWT format: header.payload.signature
        assertThat(token.split("\\.")).hasSize(3);
    }

    @Test
    @DisplayName("validateAccessToken extracts correct subject from a freshly issued token")
    void validateAccessToken_extractsCorrectSubject() {
        UUID parentId = UUID.randomUUID();
        when(redisTemplate.hasKey(anyString())).thenReturn(false);

        String token  = jwtService.generateParentAccessToken(parentId);
        Claims claims = jwtService.validateAccessToken(token);

        assertThat(claims.getSubject()).isEqualTo(parentId.toString());
    }

    @Test
    @DisplayName("validateAccessToken throws UnauthorizedException for a tampered token")
    void validateAccessToken_throwsOnTamperedToken() {
        UUID   parentId = UUID.randomUUID();
        String token    = jwtService.generateParentAccessToken(parentId);
        String tampered = token.substring(0, token.length() - 4) + "XXXX";

        assertThatThrownBy(() -> jwtService.validateAccessToken(tampered))
            .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("validateAccessToken throws when token is in the revocation list")
    void validateAccessToken_throwsWhenRevoked() {
        UUID   parentId = UUID.randomUUID();
        String token    = jwtService.generateParentAccessToken(parentId);

        Claims claims = jwtService.validateAccessToken(token); // first — not yet revoked
        when(redisTemplate.hasKey(anyString())).thenReturn(false); // reset before re-validate
        // Simulate revocation
        when(redisTemplate.hasKey(contains("revoked:"))).thenReturn(true);

        assertThatThrownBy(() -> jwtService.validateAccessToken(token))
            .isInstanceOf(UnauthorizedException.class)
            .hasMessageContaining("revoked");
    }

    @Test
    @DisplayName("generateRefreshToken stores value in Redis with correct TTL")
    void generateRefreshToken_storesInRedis() {
        UUID parentId = UUID.randomUUID();
        String token  = jwtService.generateRefreshToken(parentId);

        assertThat(token).isNotBlank();
        verify(valueOps).set(
            argThat(key -> key.startsWith("refresh:")),
            eq(parentId.toString()),
            argThat(duration -> duration.toDays() == REFRESH_DAYS)
        );
    }

    @Test
    @DisplayName("resolveRefreshToken returns parentId and deletes Redis key (rotation)")
    void resolveRefreshToken_rotatesToken() {
        UUID parentId = UUID.randomUUID();
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.get(anyString())).thenReturn(parentId.toString());

        UUID resolved = jwtService.resolveRefreshToken("some-refresh-token");

        assertThat(resolved).isEqualTo(parentId);
        verify(redisTemplate).delete(anyString());
    }

    @Test
    @DisplayName("resolveRefreshToken throws UnauthorizedException when token not in Redis")
    void resolveRefreshToken_throwsWhenMissing() {
        when(valueOps.get(anyString())).thenReturn(null);

        assertThatThrownBy(() -> jwtService.resolveRefreshToken("missing-token"))
            .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("accessTokenExpirySeconds returns minutes * 60")
    void accessTokenExpirySeconds_returnsCorrectValue() {
        assertThat(jwtService.accessTokenExpirySeconds()).isEqualTo(ACCESS_MINUTES * 60);
    }
}
