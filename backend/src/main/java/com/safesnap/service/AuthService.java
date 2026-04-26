package com.safesnap.service;

import com.safesnap.config.PairingProperties;
import com.safesnap.dto.request.LoginRequest;
import com.safesnap.dto.request.PairChildRequest;
import com.safesnap.dto.request.RegisterParentRequest;
import com.safesnap.dto.response.AuthResponse;
import com.safesnap.dto.response.PairChildResponse;
import com.safesnap.exception.ResourceNotFoundException;
import com.safesnap.exception.SafeSnapException;
import com.safesnap.exception.UnauthorizedException;
import com.safesnap.model.Child;
import com.safesnap.model.Parent;
import com.safesnap.repository.ChildRepository;
import com.safesnap.repository.ParentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final String PAIRING_PREFIX = "pairing:";

    private final ParentRepository  parentRepository;
    private final ChildRepository   childRepository;
    private final PasswordEncoder   passwordEncoder;
    private final JwtService        jwtService;
    private final QrCodeService     qrCodeService;
    private final PairingProperties pairingProperties;
    private final StringRedisTemplate redisTemplate;

    @Transactional
    public AuthResponse registerParent(RegisterParentRequest request) {
        if (parentRepository.existsByEmail(request.email())) {
            throw new SafeSnapException("Email already registered", HttpStatus.CONFLICT);
        }
        Parent parent = Parent.builder()
            .email(request.email().toLowerCase().strip())
            .passwordHash(passwordEncoder.encode(request.password()))
            .build();
        parent = parentRepository.save(parent);
        log.info("Registered new parent id={}", parent.getId());
        return buildAuthResponse(parent.getId());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Parent parent = parentRepository.findByEmail(request.email().toLowerCase().strip())
            .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));
        if (!passwordEncoder.matches(request.password(), parent.getPasswordHash())) {
            throw new UnauthorizedException("Invalid credentials");
        }
        log.debug("Parent id={} authenticated", parent.getId());
        return buildAuthResponse(parent.getId());
    }

    /**
     * Generates a short-lived pairing token (stored in Redis) and encodes it
     * as a QR code. The child app scans the code and calls {@link #completeChildPairing}.
     */
    @Transactional(readOnly = true)
    public PairChildResponse initiatePairing(UUID parentId) {
        // Verify parent exists before issuing a token
        parentRepository.findById(parentId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", parentId));

        String pairingToken = UUID.randomUUID().toString();
        String redisKey     = PAIRING_PREFIX + pairingToken;
        Duration ttl        = Duration.ofSeconds(pairingProperties.tokenTtlSeconds());
        redisTemplate.opsForValue().set(redisKey, parentId.toString(), ttl);

        String qrPayload   = "safesnap://pair?token=" + pairingToken;
        String qrCodeB64   = qrCodeService.generateQrCodeBase64(qrPayload);

        log.info("Initiated pairing for parentId={}, ttl={}s", parentId, pairingProperties.tokenTtlSeconds());
        return new PairChildResponse(pairingToken, qrCodeB64, pairingProperties.tokenTtlSeconds());
    }

    /**
     * Called by the child app after scanning the QR code.
     * Validates the pairing token, creates the Child record, and returns a child JWT.
     */
    @Transactional
    public AuthResponse completeChildPairing(String pairingToken, PairChildRequest request) {
        String redisKey = PAIRING_PREFIX + pairingToken;
        String parentIdStr = redisTemplate.opsForValue().get(redisKey);
        if (parentIdStr == null) {
            throw new UnauthorizedException("Pairing token is invalid or has expired");
        }
        redisTemplate.delete(redisKey); // consume token — one-time use

        UUID parentId = UUID.fromString(parentIdStr);
        Parent parent = parentRepository.findById(parentId)
            .orElseThrow(() -> new ResourceNotFoundException("Parent", parentId));

        // Upsert: if this device paired before, update it rather than reject.
        // Allows re-pairing after app reinstall or QR refresh.
        Child child = childRepository.findByDeviceId(request.deviceId())
            .orElse(null);
        if (child == null) {
            child = Child.builder()
                .deviceName(request.deviceName())
                .deviceId(request.deviceId())
                .parent(parent)
                .lastSeenAt(Instant.now())
                .build();
            log.info("Pairing new child deviceId={} to parentId={}", request.deviceId(), parentId);
        } else {
            child.setDeviceName(request.deviceName());
            child.setParent(parent);
            child.setLastSeenAt(Instant.now());
            log.info("Re-pairing existing child id={} to parentId={}", child.getId(), parentId);
        }
        child = childRepository.save(child);

        String accessToken  = jwtService.generateChildAccessToken(child.getId());
        String refreshToken = jwtService.generateRefreshToken(child.getId());
        return new AuthResponse(
            parentId,
            accessToken,
            refreshToken,
            jwtService.accessTokenExpirySeconds(),
            jwtService.refreshTokenExpirySeconds()
        );
    }

    private AuthResponse buildAuthResponse(UUID parentId) {
        String accessToken  = jwtService.generateParentAccessToken(parentId);
        String refreshToken = jwtService.generateRefreshToken(parentId);
        return new AuthResponse(
            parentId,
            accessToken,
            refreshToken,
            jwtService.accessTokenExpirySeconds(),
            jwtService.refreshTokenExpirySeconds()
        );
    }
}
