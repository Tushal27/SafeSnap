package com.safesnap.controller;

import com.safesnap.constants.ApiRoutes;
import com.safesnap.dto.request.LoginRequest;
import com.safesnap.dto.request.PairChildRequest;
import com.safesnap.dto.request.RegisterParentRequest;
import com.safesnap.dto.response.AuthResponse;
import com.safesnap.dto.response.PairChildResponse;
import com.safesnap.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping(ApiRoutes.AUTH_BASE)
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping(ApiRoutes.AUTH_REGISTER_PARENT)
    public ResponseEntity<AuthResponse> registerParent(
        @Valid @RequestBody RegisterParentRequest request
    ) {
        AuthResponse response = authService.registerParent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping(ApiRoutes.AUTH_LOGIN)
    public ResponseEntity<AuthResponse> login(
        @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Two-step pairing flow:
     * <ol>
     *   <li>Parent calls this endpoint (authenticated) to get a QR code.</li>
     *   <li>Child app scans QR and posts its device info with the token to complete pairing.</li>
     * </ol>
     *
     * When {@code pairingToken} query param is absent, we initiate pairing for the
     * authenticated parent. When it is present, we complete pairing for the child device.
     */
    @PostMapping(ApiRoutes.AUTH_PAIR_CHILD)
    public ResponseEntity<?> pairChild(
        @RequestParam(required = false) String pairingToken,
        @RequestBody(required = false) @Valid PairChildRequest request,
        @AuthenticationPrincipal UUID parentId
    ) {
        if (pairingToken == null) {
            // Step 1: authenticated parent requests a QR code
            PairChildResponse response = authService.initiatePairing(parentId);
            return ResponseEntity.ok(response);
        }
        // Step 2: child app exchanges the scanned token for a JWT
        AuthResponse response = authService.completeChildPairing(pairingToken, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
