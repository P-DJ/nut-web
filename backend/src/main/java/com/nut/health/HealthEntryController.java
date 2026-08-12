package com.nut.health;

import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthEntryController {
    private final HealthEntryRepository repository;
    private final boolean authenticationEnabled;
    private final UUID publicOwnerId;

    public HealthEntryController(
            HealthEntryRepository repository,
            @org.springframework.beans.factory.annotation.Value("${app.auth.enabled}") boolean authenticationEnabled,
            @org.springframework.beans.factory.annotation.Value("${app.auth.public-owner-id}") UUID publicOwnerId
    ) {
        this.repository = repository;
        this.authenticationEnabled = authenticationEnabled;
        this.publicOwnerId = publicOwnerId;
    }

    @GetMapping
    public List<HealthEntryResponse> list(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) HealthCategory category
    ) {
        UUID ownerId = ownerId(jwt);
        List<HealthEntry> entries = category == null
                ? repository.findAllByOwnerIdOrderByDateDescCreatedAtDesc(ownerId)
                : repository.findAllByOwnerIdAndCategoryOrderByDateDescCreatedAtDesc(ownerId, category);
        return entries.stream().map(HealthEntryResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HealthEntryResponse create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody HealthEntryRequest request) {
        HealthEntry entry = new HealthEntry();
        entry.setOwnerId(ownerId(jwt));
        entry.setCategory(request.category());
        entry.setDate(request.date());
        entry.setNote(request.note());
        return HealthEntryResponse.from(repository.save(entry));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID id) {
        HealthEntry entry = repository.findById(id)
                .filter(item -> item.getOwnerId().equals(ownerId(jwt)))
                .orElseThrow(() -> new HealthEntryNotFoundException(id));
        repository.delete(entry);
    }

    private UUID ownerId(Jwt jwt) {
        if (jwt != null) {
            return UUID.fromString(jwt.getSubject());
        }
        if (!authenticationEnabled) {
            return publicOwnerId;
        }
        throw new IllegalStateException("未获取到登录身份。");
    }
}
