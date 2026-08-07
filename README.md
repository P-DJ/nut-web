# 坚果 · Nut

一只黑色母柴犬「坚果」的移动端成长日记（React + Vite）。

## 功能

- 首屏品牌 Hero + 时间线点滴（照片 / 视频 / 文字）
- 丝滑进场与交互动画（Framer Motion）
- 在线上传：未配置 COS 时为本地 Demo 预览；配置后直传腾讯云 COS
- 数据暂存 `localStorage`（后续可接后端）

## 开始

```bash
npm install
npm run dev
```

手机访问时可用局域网地址，或 Chrome DevTools 设备模拟。

## 腾讯云 COS（可选）

复制 `.env.example` 为 `.env` 并填写：

```bash
VITE_COS_SECRET_ID=...
VITE_COS_SECRET_KEY=...
VITE_COS_BUCKET=your-bucket-1250000000
VITE_COS_REGION=ap-guangzhou
VITE_COS_PREFIX=nut/
```

> 正式环境建议用后端签发临时密钥，避免把永久密钥写进前端。当前 Demo 方便本地联调。
