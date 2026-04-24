package com.safesnap.repository;

import com.safesnap.model.Alert;
import com.safesnap.model.Alert.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {

    /**
     * Primary listing query: all alerts for a child, newest first.
     * Used by the parent dashboard list endpoint.
     */
    Page<Alert> findByChildIdOrderByTimestampDesc(UUID childId, Pageable pageable);

    /**
     * All unacknowledged alerts across a parent's children, newest first.
     */
    @Query("""
        SELECT a FROM Alert a
        WHERE a.child.parent.id = :parentId
          AND a.acknowledged = false
        ORDER BY a.timestamp DESC
        """)
    List<Alert> findUnacknowledgedByParentId(@Param("parentId") UUID parentId);

    /**
     * Weekly stats: alert count grouped by severity for a given parent,
     * within the supplied time window.
     */
    @Query("""
        SELECT a.severity, COUNT(a)
        FROM Alert a
        WHERE a.child.parent.id = :parentId
          AND a.timestamp >= :from
          AND a.timestamp < :to
        GROUP BY a.severity
        """)
    List<Object[]> countBySeverityForParentBetween(
        @Param("parentId") UUID parentId,
        @Param("from") Instant from,
        @Param("to") Instant to
    );

    /**
     * Total alert count for a parent within a time window. Used for weekly stats.
     */
    @Query("""
        SELECT COUNT(a) FROM Alert a
        WHERE a.child.parent.id = :parentId
          AND a.timestamp >= :from
          AND a.timestamp < :to
        """)
    long countByParentBetween(
        @Param("parentId") UUID parentId,
        @Param("from") Instant from,
        @Param("to") Instant to
    );

    /**
     * All alerts for all children of a parent, newest first. Supports paging.
     */
    @Query("""
        SELECT a FROM Alert a
        WHERE a.child.parent.id = :parentId
        ORDER BY a.timestamp DESC
        """)
    Page<Alert> findByParentIdOrderByTimestampDesc(
        @Param("parentId") UUID parentId,
        Pageable pageable
    );
}
