package com.nut.health;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class HealthEntryControllerTest {
    @Mock HealthEntryRepository repository;

    @Test
    void signedInUserCanCreateAndEditOwnHealthEntry() {
        UUID owner = UUID.fromString("33333333-3333-3333-3333-333333333333");
        HealthEntryController controller = new HealthEntryController(repository);
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        HealthEntryRequest created = new HealthEntryRequest(HealthCategory.BATH, LocalDate.of(2026, 8, 1), "初始备注");

        controller.create(jwt(owner), created);
        ArgumentCaptor<HealthEntry> saved = ArgumentCaptor.forClass(HealthEntry.class);
        verify(repository).save(saved.capture());
        assertEquals(owner, saved.getValue().getOwnerId());

        UUID id = UUID.randomUUID();
        HealthEntry existing = new HealthEntry(); existing.setOwnerId(owner); existing.setCategory(HealthCategory.BATH); existing.setDate(created.date());
        when(repository.findById(id)).thenReturn(Optional.of(existing));
        HealthEntryRequest update = new HealthEntryRequest(HealthCategory.DEWORM, LocalDate.of(2026, 8, 2), "已更新");
        controller.update(jwt(owner), id, update);

        assertEquals(HealthCategory.DEWORM, existing.getCategory());
        assertEquals(LocalDate.of(2026, 8, 2), existing.getDate());
        assertEquals("已更新", existing.getNote());
    }

    @Test
    void userCannotUpdateAnotherUsersHealthEntry() {
        UUID owner = UUID.fromString("44444444-4444-4444-4444-444444444444");
        UUID other = UUID.fromString("55555555-5555-5555-5555-555555555555");
        UUID id = UUID.randomUUID();
        HealthEntry entry = new HealthEntry(); entry.setOwnerId(owner);
        when(repository.findById(id)).thenReturn(Optional.of(entry));
        HealthEntryController controller = new HealthEntryController(repository);

        assertThrows(HealthEntryNotFoundException.class, () -> controller.update(jwt(other), id,
                new HealthEntryRequest(HealthCategory.BATH, LocalDate.now(), null)));
        verify(repository, never()).save(entry);
    }

    private Jwt jwt(UUID id) {
        return Jwt.withTokenValue("test").header("alg", "none").subject(id.toString()).build();
    }
}
