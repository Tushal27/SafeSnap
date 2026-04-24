package com.safesnap.service;

import com.safesnap.dto.response.StatsResponse;
import com.safesnap.model.Alert.Severity;
import com.safesnap.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StatsService {

    private final AlertRepository alertRepository;

    @Transactional(readOnly = true)
    public StatsResponse getWeeklyStats(UUID parentId) {
        Instant windowEnd   = Instant.now();
        Instant windowStart = windowEnd.minus(7, ChronoUnit.DAYS);

        long total = alertRepository.countByParentBetween(parentId, windowStart, windowEnd);
        Map<Severity, Long> bySeverity = aggregateBySeverity(parentId, windowStart, windowEnd);
        long unacknowledged = alertRepository.findUnacknowledgedByParentId(parentId).size();

        log.debug("Weekly stats for parentId={}: total={}", parentId, total);
        return new StatsResponse(windowStart, windowEnd, total, bySeverity, unacknowledged);
    }

    private Map<Severity, Long> aggregateBySeverity(UUID parentId, Instant from, Instant to) {
        Map<Severity, Long> result = new EnumMap<>(Severity.class);
        // Initialise all severities to 0 so the response is always complete
        Arrays.stream(Severity.values()).forEach(s -> result.put(s, 0L));

        List<Object[]> rows = alertRepository.countBySeverityForParentBetween(parentId, from, to);
        for (Object[] row : rows) {
            Severity severity = (Severity) row[0];
            long     count    = (Long)     row[1];
            result.put(severity, count);
        }
        return result;
    }
}
