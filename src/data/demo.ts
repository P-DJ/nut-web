import type { Moment } from './types'

/** Demo 媒体：使用公开可访问的黑柴 / 柴犬参考图，后续可替换为你的 COS 地址 */
export const demoMoments: Moment[] = [
  {
    id: 'demo-1',
    type: 'photo',
    title: '窗边的小太阳',
    body: '下午四点的光刚好落在地毯上，坚果趴着打盹，耳朵偶尔抖一下。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_2813.heic',
    createdAt: '2026-08-05T16:20:00.000Z',
    tags: ['日常', '午睡'],
  },
  {
    id: 'demo-2',
    type: 'text',
    title: '两岁生日小记',
    body: '今天满两岁啦。还是那双圆圆的黑眼睛，走起路来却比小时候稳多了。谢谢你来到我们家，坚果。',
    createdAt: '2026-07-18T09:00:00.000Z',
    tags: ['生日'],
  },
  {
    id: 'demo-3',
    type: 'photo',
    title: '第一次认真散步',
    body: '公园新落了一层薄薄的落叶，她一步一步踩过去，像在巡视自己的王国。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_9200.HEIC',
    createdAt: '2026-06-22T08:40:00.000Z',
    tags: ['散步', '公园'],
  },
  {
    id: 'demo-4',
    type: 'video',
    title: '甩尾巴的小片段',
    body: '听到「出去玩」三个字之后的三秒钟——尾巴比人还积极。',
    mediaUrl:
      'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&q=80',
    createdAt: '2026-05-30T19:15:00.000Z',
    tags: ['视频'],
  },
  {
    id: 'demo-5',
    type: 'photo',
    title: '黑色的绒毛',
    body: '柴犬的毛摸起来像冬天的毛衣。靠近看，其实不是纯黑，阳光下会透出一点点咖啡棕。',
    mediaUrl:
      'https://peter-typora-images-1464426644.cos.ap-beijing.myqcloud.com/IMG_9204.HEIC',
    createdAt: '2026-04-12T14:05:00.000Z',
    tags: ['特写'],
  },
]
