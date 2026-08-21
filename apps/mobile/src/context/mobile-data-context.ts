import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'

import type { HealthEntry, Moment } from '../../../../packages/shared/src/types'

export type MobileData = {
  session: Session | null
  timeline: Moment[]
  health: HealthEntry[]
  timelineError: string
  healthError: string
  refreshing: boolean
  canManage: boolean
  refresh: (session: Session | null) => Promise<void>
  onRefresh: () => Promise<void>
  removeTimeline: (id: string) => Promise<void>
  removeHealth: (id: string) => Promise<void>
}

export const MobileDataContext = createContext<MobileData | null>(null)
