package com.nut.health;

import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class SupabaseStorageClient {
    private static final String BUCKET = "timeline-media";
    private final RestClient client;
    private final String apiUrl;
    private final boolean configured;

    public SupabaseStorageClient(@Value("${app.supabase.url:}") String apiUrl,
                                 @Value("${app.supabase.service-role-key:}") String serviceRoleKey) {
        this.apiUrl = apiUrl.replaceAll("/$", "");
        this.configured = !this.apiUrl.isBlank() && !serviceRoleKey.isBlank();
        this.client = RestClient.builder().baseUrl(this.configured ? this.apiUrl + "/storage/v1" : "http://127.0.0.1")
                .defaultHeader("Authorization", "Bearer " + serviceRoleKey)
                .defaultHeader("apikey", serviceRoleKey).build();
    }

    public String createSignedUrl(String path) {
        if (path == null || path.startsWith("/content/")) return path;
        requireConfigured();
        Map<?, ?> response = client.post().uri("/object/sign/" + BUCKET + "/" + path)
                .contentType(MediaType.APPLICATION_JSON).body(Map.of("expiresIn", 3600))
                .retrieve().body(Map.class);
        Object signedUrl = response == null ? null : response.get("signedURL");
        return signedUrl == null ? null : apiUrl + "/storage/v1" + signedUrl;
    }

    public UploadAuthorization createUploadUrl(String path) {
        requireConfigured();
        Map<?, ?> response = client.post().uri("/object/upload/sign/" + BUCKET + "/" + path)
                .retrieve().body(Map.class);
        if (response == null || response.get("url") == null) {
            throw new IllegalStateException("无法获取媒体上传地址。");
        }
        return new UploadAuthorization(apiUrl + "/storage/v1" + response.get("url"));
    }

    public void delete(String path) {
        if (path == null || path.startsWith("/content/")) return;
        requireConfigured();
        client.method(HttpMethod.DELETE).uri("/object/{bucket}", BUCKET)
                .contentType(MediaType.APPLICATION_JSON).body(Map.of("prefixes", new String[]{path}))
                .retrieve().toBodilessEntity();
    }

    private void requireConfigured() {
        if (!configured) throw new IllegalStateException("Supabase Storage 未配置，请设置 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY。");
    }

    public record UploadAuthorization(String uploadUrl) {}
}
