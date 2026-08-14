package com.nut.health;
import java.time.*; import java.util.*;
public record TimelineEntryResponse(UUID id, TimelineType type, String title, String body, String media,
    String mediaPath, LocalDate date, String time, List<String> tags, Instant createdAt) {}
