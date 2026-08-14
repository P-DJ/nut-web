package com.nut.health;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity @Table(name = "timeline_entries")
public class TimelineEntry {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @Column(name = "owner_id", nullable = false) private UUID ownerId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 16) private TimelineType type;
    @Column(nullable = false, length = 160) private String title;
    @Column(length = 5000) private String body;
    @Column(name = "media_path", length = 500) private String mediaPath;
    @Column(nullable = false) private LocalDate date;
    @Column(length = 5) private String time;
    @Column(nullable = false, columnDefinition = "text[]") private String[] tags = new String[0];
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void onCreate() { createdAt = Instant.now(); }
    public UUID getId(){return id;} public UUID getOwnerId(){return ownerId;} public void setOwnerId(UUID v){ownerId=v;}
    public TimelineType getType(){return type;} public void setType(TimelineType v){type=v;} public String getTitle(){return title;} public void setTitle(String v){title=v;}
    public String getBody(){return body;} public void setBody(String v){body=v;} public String getMediaPath(){return mediaPath;} public void setMediaPath(String v){mediaPath=v;}
    public LocalDate getDate(){return date;} public void setDate(LocalDate v){date=v;} public String getTime(){return time;} public void setTime(String v){time=v;}
    public String[] getTags(){return tags;} public void setTags(String[] v){tags=v;} public Instant getCreatedAt(){return createdAt;}
}
