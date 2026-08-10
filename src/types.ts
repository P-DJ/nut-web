export type PageId = 'home' | 'timeline' | 'health' | 'about'

export type MomentType = 'photo' | 'video' | 'text'

export interface Moment {
  id: string
  type: MomentType
  title: string
  body?: string
  media?: string
  /** Calendar date in YYYY-MM-DD format. */
  date: string
  /** Optional 24-hour time in HH:mm format. */
  time?: string
  tags: string[]
  duration?: string
}

export type HealthCategory = 'bath' | 'deworm' | 'cycle'

export interface HealthEntry {
  id: string
  category: HealthCategory
  /** Record date in YYYY-MM-DD format. */
  date: string
  note?: string
}
