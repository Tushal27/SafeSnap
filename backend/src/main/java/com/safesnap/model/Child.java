package com.safesnap.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "children",
    indexes = {
        @Index(name = "idx_child_device_id", columnList = "device_id", unique = true),
        @Index(name = "idx_child_parent_id", columnList = "parent_id")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"parent", "alerts"})
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "device_name", nullable = false, length = 128)
    private String deviceName;

    @Column(name = "device_id", nullable = false, unique = true, length = 256)
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "parent_id", nullable = false)
    private Parent parent;

    @CreationTimestamp
    @Column(name = "paired_at", nullable = false, updatable = false)
    private Instant pairedAt;

    @Column(name = "last_seen_at")
    private Instant lastSeenAt;

    @Column(name = "is_online", nullable = false)
    @Builder.Default
    private boolean isOnline = false;

    @OneToMany(mappedBy = "child", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Alert> alerts = new ArrayList<>();
}
