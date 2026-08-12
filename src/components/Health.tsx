import { useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { healthContent } from '../content/health/content'
import { formatRecordDate } from '../lib/formatDate'
import { createHealthEntry, deleteHealthEntry, getHealthEntries } from '../lib/healthApi'
import { supabase } from '../lib/supabase'
import { IconBath, IconClose, IconLeaf, IconPlus, IconShield } from './Icons'
import type { HealthCategory } from '../types'

const categories: { id: HealthCategory; title: string; Icon: typeof IconBath }[] = [
  { id: 'bath', title: '洗澡记录', Icon: IconBath },
  { id: 'deworm', title: '驱虫记录', Icon: IconShield },
  { id: 'cycle', title: '生理周期', Icon: IconLeaf },
]

const today = () => new Date().toLocaleDateString('en-CA')
const publicMode = import.meta.env.VITE_HEALTH_PUBLIC_MODE === 'true'

export function Health() {
  const [session, setSession] = useState<Session | null>(null)
  const [entries, setEntries] = useState(healthContent)
  const [email, setEmail] = useState('')
  const [category, setCategory] = useState<HealthCategory>('bath')
  const [date, setDate] = useState(today)
  const [note, setNote] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const canManage = Boolean(session) || publicMode

  useEffect(() => {
    let isMounted = true
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      if (isMounted) setSession(currentSession)
    }).finally(() => {
      if (isMounted) setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (isMounted) setSession(currentSession)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!canManage) {
      setEntries(healthContent)
      return
    }

    setIsLoading(true)
    getHealthEntries(session)
      .then(setEntries)
      .catch((error: Error) => setMessage(error.message))
      .finally(() => setIsLoading(false))
  }, [canManage, session])

  const groupedEntries = useMemo(() => categories.map((item) => ({
    ...item,
    entries: entries.filter((entry) => entry.category === item.id).sort((a, b) => b.date.localeCompare(a.date)),
  })), [entries])

  async function sendMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    })
    setMessage(error ? error.message : '登录链接已发送，请在邮箱中打开。')
  }

  async function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canManage) return
    setIsSaving(true)
    setMessage('')
    try {
      const created = await createHealthEntry(session, { category, date, note: note.trim() || undefined })
      setEntries((current) => [created, ...current])
      setNote('')
      setDate(today())
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存失败，请稍后重试。')
    } finally {
      setIsSaving(false)
    }
  }

  async function removeEntry(id: string) {
    if (!canManage) return
    setMessage('')
    try {
      await deleteHealthEntry(session, id)
      setEntries((current) => current.filter((entry) => entry.id !== id))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '删除失败，请稍后重试。')
    }
  }

  return (
    <main className="page-shell health-page">
      <header className="page-head"><div><p>CARE LOG</p><h1>健康档案</h1></div>{session ? <button className="health-logout" type="button" onClick={() => void supabase.auth.signOut()}>退出登录</button> : null}</header>
      <p className="page-lead">把每一次细心照料，都留在这里。</p>
      {canManage ? (
        <form className="health-form" onSubmit={addEntry}>
          <div className="health-form-title"><IconPlus size={18} /><span>新增记录</span></div>
          <div className="health-form-fields">
            <label>护理项目<select value={category} onChange={(event) => setCategory(event.target.value as HealthCategory)}>{categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
            <label>记录日期<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} required /></label>
          </div>
          <label>备注（可选）<input value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="例如：使用燕麦舒缓洗护" /></label>
          <button className="health-submit" type="submit" disabled={isSaving}>{isSaving ? '保存中...' : '保存记录'}</button>
        </form>
      ) : (
        <form className="health-login" onSubmit={sendMagicLink}>
          <div><strong>登录后管理档案</strong><span>可手动新增、查看和删除历史记录。</span></div>
          <label className="sr-only" htmlFor="health-email">邮箱</label>
          <input id="health-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="你的邮箱" required />
          <button type="submit">发送登录链接</button>
        </form>
      )}
      {message ? <p className="health-message" role="status">{message}</p> : null}
      <section className="health-list" aria-busy={isLoading}>
        {groupedEntries.map(({ id, title, Icon, entries: categoryEntries }) => {

          return (
            <article className="health-card" key={id}>
              <div className="health-card-head">
                <span className="health-icon"><Icon size={20} /></span>
                <h2>{title}</h2>
                <span className="health-total">{categoryEntries.length} 次</span>
              </div>
              <ol className="health-history">
                {categoryEntries.map((entry) => (
                  <li key={entry.id}>
                    <div className="health-entry-head"><time dateTime={entry.date}>{formatRecordDate(entry.date)}</time>{canManage ? <button className="health-delete" type="button" onClick={() => removeEntry(entry.id)} aria-label={`删除 ${formatRecordDate(entry.date)} 的${title}`} title="删除记录"><IconClose size={14} /></button> : null}</div>
                    {entry.note ? <p>{entry.note}</p> : null}
                  </li>
                ))}
                {!categoryEntries.length && !isLoading ? <li className="health-empty">暂无记录</li> : null}
              </ol>
            </article>
          )
        })}
      </section>
    </main>
  )
}
