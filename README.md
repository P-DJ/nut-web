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

## 内容维护

每个模块只编辑自己的内容文件：

- 首页：`src/content/home/content.ts`，素材：`public/content/home/`
- 时间线：`src/content/timeline/content.ts`，图片：`public/content/timeline/images/`，视频：`public/content/timeline/videos/`
- 健康档案：`src/content/health/content.ts`，素材：`public/content/health/`
- 关于坚果：`src/content/about/content.ts`，素材：`public/content/about/`

跨模块复用的通用素材放在 `public/content/shared/`。内容文件内提供了录入示例；日期使用 `YYYY-MM-DD`，时间可选，使用 `HH:mm`。
