import type { Session } from '@supabase/supabase-js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'

import type { HealthEntry, Moment } from '../../../../packages/shared/src/types'
import { canManageTimeline, deleteHealthEntry, deleteTimelineEntry, getHealthEntries, getTimeline } from '../lib/api'
import { supabase } from '../lib/supabase'
import { MobileDataContext, type MobileData } from './mobile-data-context'

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([promise, new Promise<T>((_resolve, reject) => setTimeout(() => reject(new Error(message)), timeoutMs))])
}

export function MobileDataProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [timeline, setTimeline] = useState<Moment[]>([])
  const [health, setHealth] = useState<HealthEntry[]>([])
  const [timelineError, setTimelineError] = useState('')
  const [healthError, setHealthError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [canManage, setCanManage] = useState(false)

  const refresh = useCallback(async (activeSession: Session | null) => {
    const timelineJob = getTimeline()
      .then((items) => { setTimeline(items); setTimelineError('') })
      .catch((error: unknown) => setTimelineError(error instanceof Error ? error.message : '时间线暂时无法同步。'))
    const healthJob = activeSession
      ? getHealthEntries(activeSession)
          .then((items) => { setHealth(items); setHealthError('') })
          .catch((error: unknown) => setHealthError(error instanceof Error ? error.message : '健康档案暂时无法同步。'))
      : Promise.resolve(setHealth([]))
    await Promise.all([timelineJob, healthJob])
    setCanManage(await canManageTimeline(activeSession).catch(() => false))
  }, [])

  useEffect(() => {
    if (!supabase) {
      setTimelineError('移动端尚未配置连接信息。可先浏览首页与关于页；同步数据前请填写 apps/mobile/.env。')
      return
    }
    let active = true
    void (async () => {
      try {
        const current = (await withTimeout(supabase.auth.getSession(), 8_000, '会话初始化超时，请检查网络后重试。')).data.session
        if (!active) return
        setSession(current)
        await refresh(current)
      } catch (error) {
        if (active) setTimelineError(error instanceof Error ? error.message : '初始化失败，请稍后重试。')
      }
    })()
    const subscription = supabase.auth.onAuthStateChange((_event, current) => {
      setSession(current)
      void refresh(current)
    }).data.subscription
    return () => { active = false; subscription.unsubscribe() }
  }, [refresh])

  const value = useMemo<MobileData>(() => ({
    session,
    timeline,
    health,
    timelineError,
    healthError,
    refreshing,
    canManage,
    refresh,
    onRefresh: async () => {
      setRefreshing(true)
      try { await refresh(session) } finally { setRefreshing(false) }
    },
    removeTimeline: async (id) => {
      if (!session) return
      try {
        await deleteTimelineEntry(session, id)
        setTimeline((items) => items.filter((item) => item.id !== id))
      } catch (error) {
        Alert.alert('删除失败', error instanceof Error ? error.message : '请稍后重试。')
      }
    },
    removeHealth: async (id) => {
      if (!session) return
      try {
        await deleteHealthEntry(session, id)
        setHealth((items) => items.filter((item) => item.id !== id))
      } catch (error) {
        Alert.alert('删除失败', error instanceof Error ? error.message : '请稍后重试。')
      }
    },
  }), [canManage, health, healthError, refresh, refreshing, session, timeline, timelineError])

  return <MobileDataContext.Provider value={value}>{children}</MobileDataContext.Provider>
}
