import type { Moment } from '../types'

/** Demo 媒体：使用提供的小狗照片作为首页展示内容。 */
export const demoMoments: Moment[] = [
  {
    id: 'demo-1',
    type: 'photo',
    title: '初夏午后',
    body: '阳光落在她的毛发上，像给每一寸日常都加了一点温柔。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_9200.jpg',
    createdAt: '2026-08-05T16:20:00.000Z',
    tags: ['日常'],
  },
  {
    id: 'demo-2',
    type: 'photo',
    title: '安静的时刻',
    body: '她总能把一小段闲暇过得格外安静而惬意。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_9204.jpg',
    createdAt: '2026-07-18T09:00:00.000Z',
    tags: ['午后'],
  },
  {
    id: 'demo-3',
    type: 'photo',
    title: '微笑的眼神',
    body: '每一次抬头，都像是在和这个世界打个招呼。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_9509.jpg',
    createdAt: '2026-06-22T08:40:00.000Z',
    tags: ['眼神'],
  },
  {
    id: 'demo-4',
    type: 'photo',
    title: '温柔的侧脸',
    body: '小小的毛发、柔和的表情，让人忍不住多看一眼。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_9754.jpg',
    createdAt: '2026-05-30T19:15:00.000Z',
    tags: ['特写'],
  },
]
