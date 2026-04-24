package com.safesnap.controller;

import com.safesnap.constants.ApiRoutes;
import com.safesnap.dto.response.StatsResponse;
import com.safesnap.service.StatsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping(ApiRoutes.STATS_BASE)
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping(ApiRoutes.STATS_WEEKLY)
    public ResponseEntity<StatsResponse> getWeeklyStats(
        @AuthenticationPrincipal UUID parentId
    ) {
        return ResponseEntity.ok(statsService.getWeeklyStats(parentId));
    }
}
