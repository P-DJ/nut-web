import { useCallback, useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import './App.css'
import { About } from './components/About'
import { BottomNav } from './components/BottomNav'
import { Health } from './components/Health'
import { Hero } from './components/Hero'
import { LoadingScreen } from './components/LoadingScreen'
import { MediaViewer } from './components/MediaViewer'
import { Timeline } from './components/Timeline'
import { deleteHealthEntry, getHealthEntries } from './lib/healthApi'
import { canManageTimeline as getTimelinePermission, deleteTimelineEntry, getTimeline } from './lib/timelineApi'
import { supabase } from './lib/supabase'
import type { HealthEntry, Moment, PageId } from './types'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'
// 450ms is the minimum product requirement; 800ms gives the animation enough time to read as intentional.
const minimumLoadingTime = 800

function waitForMinimumDuration(startedAt: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, Math.max(0, minimumLoadingTime - (Date.now() - startedAt))))
}

function App() {
  const [page, setPage] = useState<PageId>('home')
  const [isBooting, setIsBooting] = useState(true)
  const [viewer, setViewer] = useState<Moment | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [timelinePermission, setTimelinePermission] = useState<LoadState>('idle')
  const [timelineManagementAllowed, setTimelineManagementAllowed] = useState(false)
  const [timelinePermissionError, setTimelinePermissionError] = useState('')
  const [timelineState, setTimelineState] = useState<LoadState>('idle')
  const [timelineError, setTimelineError] = useState('')
  const [moments, setMoments] = useState<Moment[]>([])
  const [healthState, setHealthState] = useState<LoadState>('idle')
  const [healthError, setHealthError] = useState('')
  const [healthEntries, setHealthEntries] = useState<HealthEntry[]>([])
  const [timelineYear, setTimelineYear] = useState('')
  const [timelineMonth, setTimelineMonth] = useState('全年')
  const [timelineQuery, setTimelineQuery] = useState('')

  const refreshTimeline = useCallback(async () => {
    setTimelineState('loading')
    try {
      const records = await getTimeline()
      setMoments(records)
      setTimelineYear((current) => current || [...new Set(records.map((item) => item.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a))[0] || '')
      setTimelineState('ready')
      setTimelineError('')
    } catch (error) {
      setMoments([])
      setTimelineState('error')
      setTimelineError(error instanceof Error ? error.message : '时间线暂时无法同步。')
    }
  }, [])

  const refreshPermission = useCallback(async (currentSession: Session | null) => {
    setTimelinePermission('loading')
    try {
      setTimelineManagementAllowed(await getTimelinePermission(currentSession))
      setTimelinePermission('ready')
      setTimelinePermissionError('')
    } catch {
      setTimelineManagementAllowed(false)
      setTimelinePermission('error')
      setTimelinePermissionError('管理权限暂时无法确认，请稍后重试。')
    }
  }, [])

  const refreshHealth = useCallback(async (currentSession: Session) => {
    setHealthState('loading')
    try {
      setHealthEntries(await getHealthEntries(currentSession))
      setHealthState('ready')
      setHealthError('')
    } catch (error) {
      setHealthEntries([])
      setHealthState('error')
      setHealthError(error instanceof Error ? error.message : '健康档案暂时无法同步。')
    }
  }, [])

  useEffect(() => {
    let active = true
    const startedAt = Date.now()
    void (async () => {
      const [sessionResult] = await Promise.all([
        supabase.auth.getSession().catch(() => ({ data: { session: null } })),
        refreshTimeline(),
      ])
      const currentSession = sessionResult.data.session
      if (!active) return
      setSession(currentSession)
      if (!currentSession) setHealthState('ready')
      await Promise.all([refreshPermission(currentSession), waitForMinimumDuration(startedAt)])
      if (active) setIsBooting(false)
    })()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return
      setSession(nextSession)
      setHealthEntries([])
      setHealthState(nextSession ? 'idle' : 'ready')
      setHealthError('')
      void refreshPermission(nextSession)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [refreshPermission, refreshTimeline])

  useEffect(() => {
    if (page === 'health' && session && healthState === 'idle') void refreshHealth(session)
  }, [healthState, page, refreshHealth, session])

  async function navigate(nextPage: PageId) {
    if (nextPage !== 'health' || !session || healthState === 'ready') {
      setPage(nextPage)
      return
    }
    setPage(nextPage)
    await refreshHealth(session)
  }

  async function retryTimeline() { await refreshTimeline() }
  async function retryHealth() { if (session) await refreshHealth(session) }
  async function removeHealthEntry(id: string) {
    if (!session) return
    await deleteHealthEntry(session, id)
    setHealthEntries((entries) => entries.filter((entry) => entry.id !== id))
  }

  const loading = isBooting
  const timelineReady = timelinePermission === 'ready'

  return (
    <div className={`app page-${page}`}>
      {loading ? <LoadingScreen /> : <>
        {page === 'home' ? <Hero /> : null}
        {page === 'timeline' ? <Timeline moments={moments} year={timelineYear} month={timelineMonth} query={timelineQuery} onYearChange={setTimelineYear} onMonthChange={setTimelineMonth} onQueryChange={setTimelineQuery} onOpen={setViewer} session={session} canManage={timelineReady && timelineManagementAllowed} permissionReady={timelineReady} permissionError={timelinePermission === 'error' ? timelinePermissionError : ''} error={timelineState === 'error' ? timelineError : ''} onRetry={retryTimeline} onRetryPermission={() => refreshPermission(session)} onRefresh={refreshTimeline} onDelete={async (id) => { if (session) { await deleteTimelineEntry(session, id); setMoments((current) => current.filter((moment) => moment.id !== id)) } }} /> : null}
        {page === 'health' ? <Health session={session} entries={healthEntries} loadState={healthState} error={healthError} onRetry={retryHealth} onEntriesChange={setHealthEntries} onDelete={removeHealthEntry} /> : null}
        {page === 'about' ? <About /> : null}
        <BottomNav active={page} onChange={(nextPage) => void navigate(nextPage)} />
        <MediaViewer moment={viewer} onClose={() => setViewer(null)} />
      </>}
    </div>
  )
}

export default App
