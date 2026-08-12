package com.nut.health;

import java.util.UUID;

public class HealthEntryNotFoundException extends RuntimeException {
    public HealthEntryNotFoundException(UUID id) {
        super("Health entry not found: " + id);
    }
}
