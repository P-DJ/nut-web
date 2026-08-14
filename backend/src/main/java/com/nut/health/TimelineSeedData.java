package com.nut.health;

import java.time.LocalDate;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class TimelineSeedData {
    @Bean ApplicationRunner importLegacyTimeline(TimelineEntryRepository repository, @Value("${app.auth.admin-user-id:}") String adminUserId) {
        return args -> {
            if (adminUserId.isBlank()) return;
            UUID adminId = UUID.fromString(adminUserId);
            seed(repository, adminId, "青岛的午后", "带坚果来看青岛的海啦，鼻头上全是沙子，开心得不得了。", "/content/timeline/images/byTheSea.jpg", "2025-03-15", "15:36", new String[]{"散步", "海边"});
            seed(repository, adminId, "第一次洗澡", "坚果第一次洗澡，很乖，不吵不闹，洗得很开心，毛发蓬松干净了很多。", "/content/timeline/images/shower.jpg", "2024-12-14", "12:33", new String[]{"洗澡"});
            seed(repository, adminId, "欢迎来到我的世界", "坚果刚来家里没几天，睡得正香", "/content/timeline/images/come.jpg", "2024-09-16", "10:03", new String[]{"新家"});
        };
    }
    private void seed(TimelineEntryRepository repository, UUID owner, String title, String body, String media, String date, String time, String[] tags) {
        if (repository.findAll().stream().anyMatch(entry -> entry.getTitle().equals(title) && entry.getDate().equals(LocalDate.parse(date)))) return;
        TimelineEntry entry = new TimelineEntry(); entry.setOwnerId(owner); entry.setType(TimelineType.photo); entry.setTitle(title); entry.setBody(body); entry.setMediaPath(media); entry.setDate(LocalDate.parse(date)); entry.setTime(time); entry.setTags(tags); repository.save(entry);
    }
}
