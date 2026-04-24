package com.safesnap.repository;

import com.safesnap.model.Alert;
import com.safesnap.model.Alert.Severity;
import com.safesnap.model.Child;
import com.safesnap.model.Parent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers
class AlertRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("safesnap_test")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",      postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.flyway.enabled", () -> "false");
    }

    @Autowired private AlertRepository  alertRepository;
    @Autowired private ChildRepository  childRepository;
    @Autowired private ParentRepository parentRepository;

    private Child child;
    private Parent parent;

    @BeforeEach
    void setUp() {
        alertRepository.deleteAll();
        childRepository.deleteAll();
        parentRepository.deleteAll();

        parent = parentRepository.save(Parent.builder()
            .email("repo-test@example.com")
            .passwordHash("hash")
            .build());

        child = childRepository.save(Child.builder()
            .deviceName("Test Device")
            .deviceId("unique-device-id-repo-test")
            .parent(parent)
            .build());
    }

    @Test
    @DisplayName("findByChildIdOrderByTimestampDesc returns alerts newest-first")
    void findByChildIdOrderByTimestampDesc_returnsNewestFirst() {
        Instant base = Instant.now().truncatedTo(ChronoUnit.MILLIS);

        Alert older = alertRepository.save(buildAlert(base.minusSeconds(120), Severity.LOW));
        Alert newer = alertRepository.save(buildAlert(base,                  Severity.HIGH));

        Page<Alert> result = alertRepository.findByChildIdOrderByTimestampDesc(
            child.getId(), PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getId()).isEqualTo(newer.getId());
        assertThat(result.getContent().get(1).getId()).isEqualTo(older.getId());
    }

    @Test
    @DisplayName("findByChildIdOrderByTimestampDesc pagination works correctly")
    void findByChildIdOrderByTimestampDesc_paginatesCorrectly() {
        Instant base = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        for (int i = 0; i < 5; i++) {
            alertRepository.save(buildAlert(base.minusSeconds(i * 10L), Severity.MEDIUM));
        }

        Page<Alert> firstPage  = alertRepository.findByChildIdOrderByTimestampDesc(child.getId(), PageRequest.of(0, 3));
        Page<Alert> secondPage = alertRepository.findByChildIdOrderByTimestampDesc(child.getId(), PageRequest.of(1, 3));

        assertThat(firstPage.getContent()).hasSize(3);
        assertThat(firstPage.getTotalElements()).isEqualTo(5);
        assertThat(secondPage.getContent()).hasSize(2);
    }

    @Test
    @DisplayName("findUnacknowledgedByParentId returns only unacknowledged alerts")
    void findUnacknowledgedByParentId_returnsOnlyUnacknowledged() {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        alertRepository.save(buildAlert(now.minusSeconds(30), Severity.LOW));
        Alert acked = Alert.builder()
            .child(child)
            .timestamp(now)
            .severityScore(0.9)
            .imageHash("e".repeat(64))
            .severity(Severity.CRITICAL)
            .acknowledged(true)
            .acknowledgedAt(now)
            .build();
        alertRepository.save(acked);

        List<Alert> unacked = alertRepository.findUnacknowledgedByParentId(parent.getId());

        assertThat(unacked).hasSize(1);
        assertThat(unacked.get(0).isAcknowledged()).isFalse();
    }

    @Test
    @DisplayName("countBySeverityForParentBetween aggregates correctly per severity")
    void countBySeverityForParentBetween_aggregatesPerSeverity() {
        Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        alertRepository.save(buildAlert(now.minusSeconds(10), Severity.HIGH));
        alertRepository.save(buildAlert(now.minusSeconds(20), Severity.HIGH));
        alertRepository.save(buildAlert(now.minusSeconds(30), Severity.LOW));

        List<Object[]> rows = alertRepository.countBySeverityForParentBetween(
            parent.getId(),
            now.minus(1, ChronoUnit.HOURS),
            now.plus(1, ChronoUnit.HOURS)
        );

        assertThat(rows).isNotEmpty();
        long highCount = rows.stream()
            .filter(row -> Severity.HIGH.equals(row[0]))
            .mapToLong(row -> (Long) row[1])
            .sum();
        assertThat(highCount).isEqualTo(2);
    }

    private Alert buildAlert(Instant timestamp, Severity severity) {
        return Alert.builder()
            .child(child)
            .timestamp(timestamp)
            .severityScore(0.5)
            .imageHash("f".repeat(64))
            .severity(severity)
            .build();
    }
}
