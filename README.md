# 坚果 · Nut

一只黑色柴犬「坚果」的移动端成长档案（React + Vite）。

## 功能

- 全屏写真首页 + 时间线点滴（照片 / 视频 / 文字）
- 年份、月份和关键词筛选
- 洗澡、驱虫、生理周期健康档案
- 关于坚果的基础资料页

## 开始

```bash
npm install
npm run dev
```

手机访问时可用局域网地址，或 Chrome DevTools 设备模拟。

## 时间线管理

时间线由 Supabase Storage 与 Java API 保存。Supabase Dashboard 中预先创建管理员邮箱和密码；登录后即可新增图片、视频或文字记录，并删除记录。访客可以浏览时间线。

健康档案同样需要登录后才可新增或删除；访客只可查看项目内置的护理说明。

图片会在浏览器压缩至最多 2 MB；视频不在浏览器转码，原文件最多 45 MB 后直接上传。请使用目标设备可播放的视频格式。免费 Supabase 计划包含 1 GB Storage、单文件最多 50 MB，且项目连续一周不活跃会暂停。

## 健康记录 API

Java 后端位于 `backend/`，使用 Spring Boot、Supabase PostgreSQL、Auth 和私有 Storage。配置与运行说明见 `backend/README.md`。

## 移动端（Expo）

移动端位于 apps/mobile/，与当前 Vite Web 端并行维护，Web 入口和发布方式不变。

    cd apps/mobile
    cp .env.example .env
    npm run start

在 .env 中填入与 Web 端一致的 Supabase URL、Publishable Key，以及健康记录后端地址。真机访问本地 Spring Boot 服务时，EXPO_PUBLIC_HEALTH_API_URL 必须使用电脑的局域网 IP，例如 http://192.168.1.20:8080，不能使用 localhost。

开发初期可在手机安装 Expo Go 后扫描终端二维码；接入自定义原生能力或准备发布时，使用 Expo development build。移动端的类型与日期格式化逻辑在 packages/shared/，Web 端通过转发层继续使用这些定义。
