package com.safesnap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.safesnap.dto.request.ReportAlertRequest;
import com.safesnap.dto.response.AlertResponse;
import com.safesnap.model.Alert.Severity;
import com.safesnap.service.AlertService;
import com.safesnap.service.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static com.safesnap.constants.ApiRoutes.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AlertController.class)
class AlertControllerTest {

    @Autowired private MockMvc      mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockBean private AlertService  alertService;
    @MockBean private JwtService    jwtService;
    @MockBean private com.safesnap.config.JwtAuthenticationFilter jwtAuthFilter;
    @MockBean private com.safesnap.config.CorsProperties corsProperties;

    private static final String REPORT_URL = ALERTS_BASE + ALERTS_REPORT;
    private static final String LIST_URL   = ALERTS_BASE + ALERTS_LIST;

    @Test
    @WithMockUser(roles = "CHILD")
    @DisplayName("POST /alerts/report returns 201 Created and persists alert metadata")
    void reportAlert_returns201AndAlertResponse() throws Exception {
        UUID alertId  = UUID.randomUUID();
        UUID childId  = UUID.randomUUID();
        String hash   = "a".repeat(64);
        Instant ts    = Instant.parse("2026-04-24T10:00:00Z");

        ReportAlertRequest request = new ReportAlertRequest(
            "device-xyz", ts, 0.75, hash, Severity.HIGH
        );
        AlertResponse stub = new AlertResponse(
            alertId, childId, "Child's Phone", ts, 0.75, hash, Severity.HIGH, false, null
        );
        when(alertService.reportAlert(any())).thenReturn(stub);

        mockMvc.perform(post(REPORT_URL).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(alertId.toString()))
            .andExpect(jsonPath("$.severity").value("HIGH"))
            .andExpect(jsonPath("$.imageHash").value(hash))
            .andExpect(jsonPath("$.acknowledged").value(false));
    }

    @Test
    @DisplayName("GET /alerts/list returns 401 when no authentication is provided")
    void listAlerts_returns401WithoutAuth() throws Exception {
        mockMvc.perform(get(LIST_URL))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "PARENT")
    @DisplayName("GET /alerts/list returns 200 with paginated results for authenticated parent")
    void listAlerts_returns200ForAuthenticatedParent() throws Exception {
        UUID alertId = UUID.randomUUID();
        AlertResponse stub = new AlertResponse(
            alertId, UUID.randomUUID(), "Kid Phone", Instant.now(),
            0.6, "b".repeat(64), Severity.MEDIUM, false, null
        );
        when(alertService.listAlertsForParent(any(UUID.class), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(stub)));

        mockMvc.perform(get(LIST_URL))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content").isArray())
            .andExpect(jsonPath("$.content[0].severity").value("MEDIUM"));
    }

    @Test
    @WithMockUser(roles = "CHILD")
    @DisplayName("POST /alerts/report returns 400 when imageHash fails regex validation")
    void reportAlert_returns400ForInvalidHash() throws Exception {
        ReportAlertRequest request = new ReportAlertRequest(
            "dev", Instant.now(), 0.5, "not-a-sha256-hash", Severity.LOW
        );

        mockMvc.perform(post(REPORT_URL).with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status").value(400));
    }
}
