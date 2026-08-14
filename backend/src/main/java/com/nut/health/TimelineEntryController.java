package com.nut.health;

import jakarta.validation.Valid;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/timeline")
public class TimelineEntryController {
    private final TimelineEntryRepository repository;
    private final SupabaseStorageClient storage;
    private final String adminUserId;

    public TimelineEntryController(TimelineEntryRepository repository, SupabaseStorageClient storage,
            @Value("${app.auth.admin-user-id:}") String adminUserId) {
        this.repository = repository; this.storage = storage; this.adminUserId = adminUserId;
    }

    @GetMapping
    public List<TimelineEntryResponse> list() { return repository.findAllByOrderByDateDescCreatedAtDesc().stream().map(this::response).toList(); }

    @GetMapping("/can-manage")
    public Map<String, Boolean> canManage(@AuthenticationPrincipal Jwt jwt) {
        return Map.of("canManage", isAdmin(jwt));
    }

    @PostMapping("/upload-url")
    public UploadUrlResponse uploadUrl(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody UploadUrlRequest request) {
        UUID owner = requireAdmin(jwt);
        String extension = switch (request.contentType()) {
            case "video/mp4" -> "mp4";
            case "video/quicktime" -> "mov";
            default -> request.contentType().substring(request.contentType().indexOf('/') + 1);
        };
        String path = owner + "/" + UUID.randomUUID() + "." + extension;
        SupabaseStorageClient.UploadAuthorization authorization = storage.createUploadUrl(path);
        return new UploadUrlResponse(path, authorization.uploadUrl());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TimelineEntryResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody TimelineEntryRequest request) {
        UUID owner = requireAdmin(jwt);
        validateMedia(request, owner);
        TimelineEntry entry = new TimelineEntry();
        entry.setOwnerId(owner); entry.setType(request.type()); entry.setTitle(request.title().trim());
        entry.setBody(blankToNull(request.body())); entry.setMediaPath(blankToNull(request.mediaPath())); entry.setDate(request.date());
        entry.setTime(blankToNull(request.time())); entry.setTags(request.tags() == null ? new String[0] : request.tags().stream().map(String::trim).filter(s -> !s.isEmpty()).distinct().toArray(String[]::new));
        return response(repository.save(entry));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        requireAdmin(jwt);
        TimelineEntry entry = repository.findById(id).orElseThrow(() -> new TimelineNotFoundException(id));
        storage.delete(entry.getMediaPath()); repository.delete(entry);
    }

    private TimelineEntryResponse response(TimelineEntry entry) {
        return new TimelineEntryResponse(entry.getId(), entry.getType(), entry.getTitle(), entry.getBody(), storage.createSignedUrl(entry.getMediaPath()), entry.getMediaPath(), entry.getDate(), entry.getTime(), List.of(entry.getTags()), entry.getCreatedAt());
    }
    private UUID requireAdmin(Jwt jwt) {
        if (!isAdmin(jwt)) throw new AccessDeniedException("仅管理员可以管理时间线。");
        return UUID.fromString(adminUserId);
    }
    private boolean isAdmin(Jwt jwt) {
        return jwt != null && !adminUserId.isBlank() && adminUserId.equals(jwt.getSubject());
    }
    private void validateMedia(TimelineEntryRequest request, UUID owner) {
        if (request.type() == TimelineType.text && request.mediaPath() != null && !request.mediaPath().isBlank()) throw new IllegalArgumentException("文字记录不能包含媒体文件。");
        if (request.type() == TimelineType.text) return;
        String path = request.mediaPath();
        if (path == null || !path.startsWith(owner + "/")) throw new IllegalArgumentException("请先上传媒体文件。");
        if (request.type() == TimelineType.photo && !path.matches(".*\\.(jpeg|png|webp)$")) throw new IllegalArgumentException("图片记录必须关联图片文件。");
        if (request.type() == TimelineType.video && !(path.endsWith(".mp4") || path.endsWith(".mov"))) throw new IllegalArgumentException("视频记录必须关联 MP4 或 MOV 文件。");
    }
    private static String blankToNull(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
