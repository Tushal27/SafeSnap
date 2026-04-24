package com.safesnap.controller;

import com.safesnap.constants.ApiRoutes;
import com.safesnap.dto.request.AcknowledgeAlertRequest;
import com.safesnap.dto.request.ReportAlertRequest;
import com.safesnap.dto.response.AlertResponse;
import com.safesnap.service.AlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping(ApiRoutes.ALERTS_BASE)
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    /**
     * Called by the child device to report alert metadata.
     * The device must be authenticated (ROLE_CHILD JWT).
     */
    @PostMapping(ApiRoutes.ALERTS_REPORT)
    public ResponseEntity<AlertResponse> reportAlert(
        @Valid @RequestBody ReportAlertRequest request
    ) {
        AlertResponse response = alertService.reportAlert(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Returns paginated alerts across all children of the authenticated parent.
     * Default page size: 20, ordered by timestamp descending.
     */
    @GetMapping(ApiRoutes.ALERTS_LIST)
    public ResponseEntity<Page<AlertResponse>> listAlerts(
        @AuthenticationPrincipal UUID parentId,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(alertService.listAlertsForParent(parentId, pageable));
    }

    @PostMapping(ApiRoutes.ALERTS_ACKNOWLEDGE)
    public ResponseEntity<AlertResponse> acknowledgeAlert(
        @AuthenticationPrincipal UUID parentId,
        @Valid @RequestBody AcknowledgeAlertRequest request
    ) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(parentId, request));
    }
}
