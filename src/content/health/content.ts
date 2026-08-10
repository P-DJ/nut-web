import type { HealthEntry } from '../../types'

/**
 * 每次护理都新增一条记录。日期使用 YYYY-MM-DD；note 可省略。
 * category 可选：bath（洗澡）、deworm（驱虫）、cycle（生理周期）。
 */
export const healthContent: HealthEntry[] = [
  { id: 'bath-2026-07-08', category: 'bath', date: '2026-07-08', note: '洗澡时剪了指甲，耳朵里也清理了一下。' },
  { id: 'bath-2026-05-29', category: 'bath', date: '2026-05-29', note: '洗澡时剪了指甲，耳朵里也清理了一下。' },
  { id: 'deworm-2026-04-02', category: 'deworm', date: '2026-04-02', note: '体内驱虫。' },
]
