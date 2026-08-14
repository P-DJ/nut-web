package com.nut.health;
import jakarta.validation.constraints.*;
public record UploadUrlRequest(@NotBlank @Pattern(regexp = "^(image/(jpeg|png|webp)|video/(mp4|quicktime))$", message = "仅支持 JPEG、PNG、WebP、MP4 或 MOV 视频。") String contentType,
                               @NotBlank @Pattern(regexp = "^[a-zA-Z0-9._-]+$") @Size(max=120) String fileName) {}
