package com.nut.health;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;

@ExtendWith(MockitoExtension.class)
class TimelineEntryControllerTest {
    private static final UUID ADMIN_ID = UUID.fromString("11111111-1111-1111-1111-111111111111");
    @Mock TimelineEntryRepository repository;
    @Mock SupabaseStorageClient storage;

    private TimelineEntryController controller() {
        return new TimelineEntryController(repository, storage, ADMIN_ID.toString());
    }

    @Test
    void administratorCanCreateTextEntry() {
        when(repository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        TimelineEntryRequest request = new TimelineEntryRequest(TimelineType.text, "体检", "一切正常", null,
                LocalDate.of(2026, 8, 13), "09:30", List.of("健康"));

        controller().create(jwt(ADMIN_ID), request);

        ArgumentCaptor<TimelineEntry> entry = ArgumentCaptor.forClass(TimelineEntry.class);
        verify(repository).save(entry.capture());
        assertEquals(ADMIN_ID, entry.getValue().getOwnerId());
        assertEquals(TimelineType.text, entry.getValue().getType());
        assertNull(entry.getValue().getMediaPath());
    }

    @Test
    void regularUserCannotCreateOrRequestUpload() {
        UUID regularUser = UUID.fromString("22222222-2222-2222-2222-222222222222");
        TimelineEntryRequest entry = new TimelineEntryRequest(TimelineType.text, "不允许", null, null,
                LocalDate.now(), null, List.of());

        assertThrows(AccessDeniedException.class, () -> controller().create(jwt(regularUser), entry));
        assertThrows(AccessDeniedException.class, () -> controller().uploadUrl(jwt(regularUser), new UploadUrlRequest("image/webp", "image.webp")));
        verifyNoInteractions(repository, storage);
    }

    @Test
    void administratorReceivesOwnerScopedUploadPathForAcceptedMedia() {
        when(storage.createUploadUrl(any())).thenReturn(new SupabaseStorageClient.UploadAuthorization("https://upload.example/signature"));

        UploadUrlResponse response = controller().uploadUrl(jwt(ADMIN_ID), new UploadUrlRequest("video/mp4", "walk.mp4"));

        assertTrue(response.path().startsWith(ADMIN_ID + "/"));
        assertTrue(response.path().endsWith(".mp4"));
        assertEquals("https://upload.example/signature", response.uploadUrl());
        verify(storage).createUploadUrl(response.path());
    }

    @Test
    void administratorCanRequestMovUpload() {
        when(storage.createUploadUrl(any())).thenReturn(new SupabaseStorageClient.UploadAuthorization("https://upload.example/signature"));

        UploadUrlResponse response = controller().uploadUrl(jwt(ADMIN_ID), new UploadUrlRequest("video/quicktime", "walk.mov"));

        assertTrue(response.path().startsWith(ADMIN_ID + "/"));
        assertTrue(response.path().endsWith(".mov"));
    }

    @Test
    void mediaTypeMustMatchServerGeneratedPathExtension() {
        String imagePath = ADMIN_ID + "/photo.webp";
        String videoPath = ADMIN_ID + "/video.mp4";

        assertThrows(IllegalArgumentException.class, () -> controller().create(jwt(ADMIN_ID), new TimelineEntryRequest(
                TimelineType.video, "不匹配", null, imagePath, LocalDate.now(), null, List.of())));
        assertThrows(IllegalArgumentException.class, () -> controller().create(jwt(ADMIN_ID), new TimelineEntryRequest(
                TimelineType.photo, "不匹配", null, videoPath, LocalDate.now(), null, List.of())));
        verifyNoInteractions(repository);
    }

    @Test
    void deletingUploadedEntryRemovesStorageObject() {
        TimelineEntry entry = new TimelineEntry();
        entry.setOwnerId(ADMIN_ID); entry.setMediaPath(ADMIN_ID + "/photo.webp");
        UUID id = UUID.randomUUID();
        when(repository.findById(id)).thenReturn(java.util.Optional.of(entry));

        controller().delete(jwt(ADMIN_ID), id);

        verify(storage).delete(ADMIN_ID + "/photo.webp");
        verify(repository).delete(entry);
    }

    private Jwt jwt(UUID id) {
        return Jwt.withTokenValue("test").header("alg", "none").subject(id.toString()).build();
    }
}
