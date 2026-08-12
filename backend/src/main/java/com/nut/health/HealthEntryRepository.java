package com.nut.health;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HealthEntryRepository extends JpaRepository<HealthEntry, UUID> {
    List<HealthEntry> findAllByOwnerIdOrderByDateDescCreatedAtDesc(UUID ownerId);
    List<HealthEntry> findAllByOwnerIdAndCategoryOrderByDateDescCreatedAtDesc(UUID ownerId, HealthCategory category);
}
