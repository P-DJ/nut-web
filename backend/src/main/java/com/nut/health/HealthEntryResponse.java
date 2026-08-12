package com.nut.health;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HealthEntryResponse(UUID id, HealthCategory category, LocalDate date, String note, Instant createdAt) {
    static HealthEntryResponse from(HealthEntry entry) {
        return new HealthEntryResponse(entry.getId(), entry.getCategory(), entry.getDate(), entry.getNote(), entry.getCreatedAt());
    }
}
