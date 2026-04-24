package com.safesnap.repository;

import com.safesnap.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChildRepository extends JpaRepository<Child, UUID> {

    List<Child> findByParentId(UUID parentId);

    Optional<Child> findByDeviceId(String deviceId);

    boolean existsByDeviceId(String deviceId);
}
