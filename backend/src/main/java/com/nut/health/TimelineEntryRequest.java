package com.nut.health;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public record TimelineEntryRequest(@NotNull TimelineType type, @NotBlank @Size(max=160) String title,
    @Size(max=5000) String body, @Size(max=500) String mediaPath, @NotNull LocalDate date,
    @Pattern(regexp="^$|^([01]\\d|2[0-3]):[0-5]\\d$") String time, @Size(max=12) List<@Size(max=32) String> tags) {}
