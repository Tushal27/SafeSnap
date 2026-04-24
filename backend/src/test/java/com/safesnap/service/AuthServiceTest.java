package com.safesnap.service;

import com.safesnap.config.PairingProperties;
import com.safesnap.dto.request.LoginRequest;
import com.safesnap.dto.request.RegisterParentRequest;
import com.safesnap.dto.response.AuthResponse;
import com.safesnap.exception.SafeSnapException;
import com.safesnap.exception.UnauthorizedException;
import com.safesnap.model.Parent;
import com.safesnap.repository.ChildRepository;
import com.safesnap.repository.ParentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private ParentRepository   parentRepository;
    @Mock private ChildRepository    childRepository;
    @Mock private JwtService         jwtService;
    @Mock private QrCodeService      qrCodeService;
    @Mock private PairingProperties  pairingProperties;
    @Mock private StringRedisTemplate redisTemplate;
    @Mock private ValueOperations<String, String> valueOps;

    // Use a real password encoder to verify hashing behaviour
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    @Captor private ArgumentCaptor<Parent> parentCaptor;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
            parentRepository, childRepository, passwordEncoder,
            jwtService, qrCodeService, pairingProperties, redisTemplate
        );
    }

    @Test
    @DisplayName("registerParent hashes the plain-text password before persisting")
    void registerParent_hashesPassword() {
        String rawPassword = "superSecret99";
        RegisterParentRequest request = new RegisterParentRequest("alice@example.com", rawPassword);

        when(parentRepository.existsByEmail(anyString())).thenReturn(false);
        when(parentRepository.save(any(Parent.class))).thenAnswer(inv -> {
            Parent p = inv.getArgument(0);
            p = Parent.builder()
                .id(UUID.randomUUID())
                .email(p.getEmail())
                .passwordHash(p.getPasswordHash())
                .build();
            return p;
        });
        when(jwtService.generateParentAccessToken(any())).thenReturn("access-token");
        when(jwtService.generateRefreshToken(any())).thenReturn("refresh-token");

        authService.registerParent(request);

        verify(parentRepository).save(parentCaptor.capture());
        String storedHash = parentCaptor.getValue().getPasswordHash();
        assertThat(storedHash).isNotEqualTo(rawPassword);
        assertThat(passwordEncoder.matches(rawPassword, storedHash)).isTrue();
    }

    @Test
    @DisplayName("registerParent returns AuthResponse containing non-null tokens")
    void registerParent_returnsAuthResponseWithTokens() {
        RegisterParentRequest request = new RegisterParentRequest("bob@example.com", "password123");
        UUID parentId = UUID.randomUUID();

        when(parentRepository.existsByEmail(anyString())).thenReturn(false);
        when(parentRepository.save(any())).thenAnswer(inv -> {
            Parent p = inv.getArgument(0);
            return Parent.builder().id(parentId).email(p.getEmail())
                .passwordHash(p.getPasswordHash()).build();
        });
        when(jwtService.generateParentAccessToken(parentId)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(parentId)).thenReturn("refresh-token");
        when(jwtService.accessTokenExpirySeconds()).thenReturn(900L);
        when(jwtService.refreshTokenExpirySeconds()).thenReturn(604800L);

        AuthResponse response = authService.registerParent(request);

        assertThat(response.accessToken()).isEqualTo("access-token");
        assertThat(response.refreshToken()).isEqualTo("refresh-token");
        assertThat(response.parentId()).isEqualTo(parentId);
    }

    @Test
    @DisplayName("registerParent throws CONFLICT when email already exists")
    void registerParent_throwsConflictForDuplicateEmail() {
        when(parentRepository.existsByEmail(anyString())).thenReturn(true);
        RegisterParentRequest request = new RegisterParentRequest("dup@example.com", "pass1234");

        assertThatThrownBy(() -> authService.registerParent(request))
            .isInstanceOf(SafeSnapException.class)
            .extracting(ex -> ((SafeSnapException) ex).getStatus())
            .isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("login returns AuthResponse for correct credentials")
    void login_returnsTokensForValidCredentials() {
        String raw  = "correctPassword";
        Parent stored = Parent.builder()
            .id(UUID.randomUUID())
            .email("carol@example.com")
            .passwordHash(passwordEncoder.encode(raw))
            .build();

        when(parentRepository.findByEmail("carol@example.com")).thenReturn(Optional.of(stored));
        when(jwtService.generateParentAccessToken(stored.getId())).thenReturn("tok");
        when(jwtService.generateRefreshToken(stored.getId())).thenReturn("ref");

        AuthResponse response = authService.login(new LoginRequest("carol@example.com", raw));
        assertThat(response.accessToken()).isEqualTo("tok");
    }

    @Test
    @DisplayName("login throws UnauthorizedException for wrong password")
    void login_throwsForWrongPassword() {
        Parent stored = Parent.builder()
            .id(UUID.randomUUID())
            .email("eve@example.com")
            .passwordHash(passwordEncoder.encode("correctPass"))
            .build();

        when(parentRepository.findByEmail("eve@example.com")).thenReturn(Optional.of(stored));

        assertThatThrownBy(() -> authService.login(new LoginRequest("eve@example.com", "wrongPass")))
            .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("login throws UnauthorizedException for unknown email")
    void login_throwsForUnknownEmail() {
        when(parentRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(new LoginRequest("ghost@example.com", "pass")))
            .isInstanceOf(UnauthorizedException.class);
    }
}
