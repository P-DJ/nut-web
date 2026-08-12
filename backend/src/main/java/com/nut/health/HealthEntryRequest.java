package com.nut.health;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record HealthEntryRequest(
        @NotNull HealthCategory category,
        @NotNull LocalDate date,
        @Size(max = 1000) String note
) {}
