export type PageId = 'home' | 'timeline' | 'health' | 'about'

export type MomentType = 'photo' | 'video' | 'text'

export interface Moment {
  id: string
  type: MomentType
  title: string
  body?: string
  media?: string
  mediaPath?: string
  date: string
  time?: string
  tags: string[]
  duration?: string
}

export type HealthCategory = 'bath' | 'deworm' | 'cycle'

export interface HealthEntry {
  id: string
  category: HealthCategory
  date: string
  note?: string
}
