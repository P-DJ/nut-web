# 坚果移动端

这是与仓库根目录 Web 应用并行的 Expo / React Native 客户端。

## 启动

    cp .env.example .env
    npm run start

手机安装 Expo Go 后，和电脑连接到同一网络，扫描终端展示的二维码即可预览。

请配置：

- EXPO_PUBLIC_SUPABASE_URL
- EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- EXPO_PUBLIC_HEALTH_API_URL

真机调试时，健康 API 地址必须使用电脑局域网 IP，而不是 localhost。

## 验证

    npx tsc --noEmit
    npm run lint
