import type { Moment } from '../../types'

/**
 * 新增记录时复制下面的对象：日期使用 YYYY-MM-DD，时间可选且使用 HH:mm。
 * 新的图片放在 public/content/timeline/images/，视频放在 public/content/timeline/videos/。
 */
export const timelineContent: Moment[] = [
  {
    id: 'm-2025-03-15',
    type: 'photo',
    title: '青岛的午后',
    body: '带坚果来看青岛的海啦，鼻头上全是沙子，开心得不得了。',
    media: '/content/timeline/images/byTheSea.jpg',
    date: '2025-03-15',
    time: '15:36',
    tags: ['散步', '海边'],
  },
  {
    id: 'm-2024-12-14',
    type: 'photo',
    title: '第一次洗澡',
    body: '坚果第一次洗澡，很乖，不吵不闹，洗得很开心，毛发蓬松干净了很多。',
    media: '/content/timeline/images/shower.jpg',
    date: '2024-12-14',
    time: '12:33',
    tags: ['洗澡'],
  },
  {
    id: 'm-2024-09-16',
    type: 'photo',
    title: '欢迎来到我的世界',
    body: '坚果刚来家里没几天，睡得正香',
    media: '/content/timeline/images/come.jpg',
    date: '2024-09-16',
    time: '10:03',
    tags: ['新家'],
  },
]
