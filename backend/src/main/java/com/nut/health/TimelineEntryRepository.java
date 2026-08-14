package com.nut.health;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TimelineEntryRepository extends JpaRepository<TimelineEntry, UUID> {
    List<TimelineEntry> findAllByOrderByDateDescCreatedAtDesc();
}
