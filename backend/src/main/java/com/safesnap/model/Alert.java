package com.safesnap.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "alerts",
    indexes = {
        @Index(name = "idx_alert_child_id",   columnList = "child_id"),
        @Index(name = "idx_alert_timestamp",  columnList = "timestamp"),
        @Index(name = "idx_alert_severity",   columnList = "severity"),
        @Index(name = "idx_alert_ack",        columnList = "acknowledged")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "child")
public class Alert {

    public enum Severity {
        LOW, MEDIUM, HIGH, CRITICAL
    }

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "child_id", nullable = false)
    private Child child;

    @Column(nullable = false)
    private Instant timestamp;

    /**
     * Normalised severity score in [0, 1] produced by the on-device ML model.
     * The server stores it for analytics but never re-derives it from raw media.
     */
    @Column(name = "severity_score", nullable = false)
    private Double severityScore;

    /**
     * SHA-256 hex digest of the image that triggered the alert.
     * The actual image is never transmitted to this server (privacy guarantee).
     */
    @Column(name = "image_hash", nullable = false, length = 64)
    private String imageHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private Severity severity;

    @Column(nullable = false)
    @Builder.Default
    private boolean acknowledged = false;

    @Column(name = "acknowledged_at")
    private Instant acknowledgedAt;
}
