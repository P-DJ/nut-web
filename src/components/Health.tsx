import { useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { formatRecordDate } from '../lib/formatDate'
import { createHealthEntry } from '../lib/healthApi'
import { supabase } from '../lib/supabase'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'
import { IconBath, IconClose, IconLeaf, IconPlus, IconShield } from './Icons'
import type { HealthCategory, HealthEntry } from '../types'

const categories: { id: HealthCategory; title: string; Icon: typeof IconBath }[] = [
  { id: 'bath', title: '洗澡记录', Icon: IconBath },
  { id: 'deworm', title: '驱虫记录', Icon: IconShield },
  { id: 'cycle', title: '生理周期', Icon: IconLeaf },
]
const today = () => new Date().toLocaleDateString('en-CA')

interface HealthProps {
  session: Session | null
  entries: HealthEntry[]
  loadState: 'idle' | 'loading' | 'ready' | 'error'
  error: string
  onRetry: () => Promise<void>
  onEntriesChange: (entries: HealthEntry[]) => void
  onDelete: (id: string) => Promise<void>
}

export function Health({ session, entries, loadState, error, onRetry, onEntriesChange, onDelete }: HealthProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [category, setCategory] = useState<HealthCategory>('bath')
  const [date, setDate] = useState(today)
  const [note, setNote] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false)
  const [loginMessage, setLoginMessage] = useState('')
  const canManage = Boolean(session)
  const isLoading = loadState === 'loading' || loadState === 'idle'
  const dirty = Boolean(category !== 'bath' || date !== today() || note)
  const groupedEntries = useMemo(() => categories.map((item) => ({ ...item, entries: entries.filter((entry) => entry.category === item.id).sort((a, b) => b.date.localeCompare(a.date)) })), [entries])
  useBodyScrollLock(drawerOpen || loginDrawerOpen)

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginMessage('')
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) setLoginMessage(signInError.message)
    else setLoginDrawerOpen(false)
    setPassword('')
  }

  async function addEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!session) return
    setIsSaving(true)
    setMessage('')
    try {
      const created = await createHealthEntry(session, { category, date, note: note.trim() || undefined })
      onEntriesChange([created, ...entries])
      setCategory('bath'); setNote(''); setDate(today()); setDrawerOpen(false); setMessage('健康记录已保存。')
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : '保存失败，请稍后重试。')
    } finally {
      setIsSaving(false)
    }
  }

  async function removeEntry(id: string) {
    setMessage('')
    try { await onDelete(id) } catch (cause) { setMessage(cause instanceof Error ? cause.message : '删除失败，请稍后重试。') }
  }

  function closeDrawer() {
    if (isSaving) return
    if (dirty && !window.confirm('丢弃本次编辑？未保存的内容将不会保留。')) return
    setCategory('bath'); setDate(today()); setNote(''); setMessage(''); setDrawerOpen(false)
  }

  return <main className="page-shell health-page">
    <header className="page-head"><div><p>CARE LOG</p><h1>健康档案</h1></div>{session ? <button className="health-logout" type="button" onClick={() => void supabase.auth.signOut()}>退出登录</button> : <button className="timeline-login-trigger" type="button" onClick={() => { setLoginMessage(''); setLoginDrawerOpen(true) }}>管理员登录</button>}</header>
    <p className="page-lead">把每一次细心照料，都留在这里。</p>
    {error ? <p className="page-error" role="status">{error}<button type="button" onClick={() => void onRetry()}>重试</button></p> : null}
    {message && !drawerOpen ? <p className="health-message" role="status">{message}</p> : null}
    {isLoading ? <p className="health-loading" role="status">正在整理健康档案...</p> : null}
    <section className="health-list" aria-busy={isLoading}>{groupedEntries.map(({ id, title, Icon, entries: categoryEntries }) => <article className="health-card" key={id}><div className="health-card-head"><span className="health-icon"><Icon size={20} /></span><h2>{title}</h2><span className="health-total">{categoryEntries.length} 次</span></div><ol className="health-history">{categoryEntries.map((entry) => <li key={entry.id}><div className="health-entry-head"><time dateTime={entry.date}>{formatRecordDate(entry.date)}</time>{canManage ? <div className="health-entry-actions"><button className="health-delete" type="button" onClick={() => void removeEntry(entry.id)} aria-label={`删除 ${formatRecordDate(entry.date)} 的${title}`} title="删除记录"><IconClose size={14} /></button></div> : null}</div>{entry.note ? <p>{entry.note}</p> : null}</li>)}{!categoryEntries.length && !isLoading ? <li className="health-empty">暂无记录</li> : null}</ol></article>)}</section>
    {canManage ? <button className="timeline-add health-add" type="button" onClick={() => { setMessage(''); setDrawerOpen(true) }} aria-label="新增健康记录" title="新增记录"><IconPlus size={24} /></button> : null}
    {drawerOpen ? <div className="timeline-drawer-layer" role="presentation"><form className="timeline-drawer health-drawer" onSubmit={addEntry} aria-label="新增健康记录"><div className="timeline-drawer-handle" /><header><h2>新增记录</h2><button className="timeline-drawer-close" type="button" onClick={closeDrawer} disabled={isSaving} aria-label="关闭新增健康记录"><IconClose size={18} /></button></header><fieldset disabled={isSaving}><label>护理项目<select value={category} onChange={(event) => setCategory(event.target.value as HealthCategory)}>{categories.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><label>记录日期<input type="date" value={date} max={today()} onChange={(event) => setDate(event.target.value)} required /></label><label>备注（可选）<input value={note} maxLength={500} onChange={(event) => setNote(event.target.value)} placeholder="例如：使用燕麦舒缓洗护" /></label></fieldset>{message ? <p className="timeline-drawer-status is-error" role="status">{message}</p> : null}<button className="timeline-save" type="submit" disabled={isSaving}>{isSaving ? '保存中...' : '保存记录'}</button></form></div> : null}
    {loginDrawerOpen ? <div className="timeline-drawer-layer" role="presentation"><form className="timeline-drawer timeline-login-drawer" onSubmit={signIn} aria-label="管理员登录"><div className="timeline-drawer-handle" /><header><div><h2>管理员登录</h2><p>登录后可管理健康档案。</p></div><button className="timeline-drawer-close" type="button" onClick={() => setLoginDrawerOpen(false)} aria-label="关闭管理员登录"><IconClose size={18} /></button></header><fieldset><label>邮箱<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="管理员邮箱" autoComplete="email" required /></label><label>密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" autoComplete="current-password" required /></label></fieldset>{loginMessage ? <p className="timeline-drawer-status is-error" role="status">{loginMessage}</p> : null}<button className="timeline-save" type="submit">登录</button></form></div> : null}
  </main>
}
