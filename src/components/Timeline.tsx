import { useEffect, useMemo, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { IconClose, IconImage, IconPlus, IconSearch, IconText, IconVideo } from './Icons'
import { MomentCard } from './MomentCard'
import type { Moment, MomentType } from '../types'
import { compressImage, validateVideo } from '../lib/mediaCompression'
import { createTimelineEntry, uploadTimelineMedia } from '../lib/timelineApi'
import { supabase } from '../lib/supabase'
import { useBodyScrollLock } from '../lib/useBodyScrollLock'

interface TimelineProps {
  moments: Moment[]
  year: string
  month: string
  query: string
  onYearChange: (year: string) => void
  onMonthChange: (month: string) => void
  onQueryChange: (query: string) => void
  onOpen: (moment: Moment) => void
  session: Session | null
  canManage: boolean
  permissionReady: boolean
  permissionError: string
  error: string
  onRetry: () => Promise<void>
  onRetryPermission: () => Promise<void>
  onRefresh: () => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const months = ['全年', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
const typeOptions: { id: MomentType; label: string; Icon: typeof IconImage }[] = [
  { id: 'photo', label: '图片', Icon: IconImage },
  { id: 'video', label: '视频', Icon: IconVideo },
  { id: 'text', label: '文字', Icon: IconText },
]
const today = () => new Date().toLocaleDateString('en-CA')

function videoPreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const source = URL.createObjectURL(file)
    video.muted = true
    video.preload = 'metadata'
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth || 160
      canvas.height = video.videoHeight || 90
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(source)
      resolve(canvas.toDataURL('image/jpeg', 0.76))
    }
    video.onerror = () => { URL.revokeObjectURL(source); reject(new Error('无法生成视频缩略图，请重新选择文件。')) }
    video.src = source
  })
}

export function Timeline({ moments, year, month, query, onYearChange, onMonthChange, onQueryChange, onOpen, session, canManage, permissionReady, permissionError, error, onRetry, onRetryPermission, onRefresh, onDelete }: TimelineProps) {
  const [type, setType] = useState<MomentType>('photo')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loginDrawerOpen, setLoginDrawerOpen] = useState(false)
  const [status, setStatus] = useState('')
  const [loginMessage, setLoginMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [pendingRecordId, setPendingRecordId] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const recordRef = useRef<HTMLDivElement>(null)
  const years = [...new Set(moments.map((moment) => moment.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a))
  const visible = useMemo(() => moments.filter((moment) => {
    const [momentYear, momentMonth] = moment.date.split('-')
    const matchesYear = momentYear === year
    const matchesMonth = month === '全年' || Number(momentMonth) === Number(month.replace('月', ''))
    const text = `${moment.title} ${moment.body ?? ''} ${moment.tags.join(' ')}`.toLowerCase()
    return matchesYear && matchesMonth && text.includes(query.trim().toLowerCase())
  }), [moments, month, query, year])

  useEffect(() => {
    if (drawerOpen || !pendingRecordId || !moments.some((moment) => moment.id === pendingRecordId)) return
    window.requestAnimationFrame(() => recordRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
    setPendingRecordId(null)
  }, [drawerOpen, moments, pendingRecordId])

  useBodyScrollLock(drawerOpen || loginDrawerOpen)

  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview) }, [preview])

  const dirty = Boolean(title || body || tags || time || file || date !== today())
  const selectedType = typeOptions.find((item) => item.id === type)!

  function clearMedia() {
    if (preview.startsWith('blob:')) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview('')
    if (fileInput.current) fileInput.current.value = ''
  }

  function resetForm() {
    clearMedia()
    setType('photo'); setTitle(''); setBody(''); setDate(today()); setTime(''); setTags(''); setStatus('')
  }

  function requestClose() {
    if (saving) return
    if (dirty && !window.confirm('丢弃本次编辑？未保存的内容将不会保留。')) return
    resetForm()
    setDrawerOpen(false)
  }

  async function selectFile(nextFile: File | null) {
    if (!nextFile) return
    setStatus('')
    clearMedia()
    const expectedPrefix = type === 'photo' ? 'image/' : 'video/'
    if (!nextFile.type.startsWith(expectedPrefix)) {
      setStatus(type === 'photo' ? '请选择图片文件。' : '请选择视频文件。')
      return
    }
    setFile(nextFile)
    try {
      setPreview(type === 'photo' ? URL.createObjectURL(nextFile) : await videoPreview(nextFile))
    } catch (cause) {
      setFile(null)
      setStatus(cause instanceof Error ? cause.message : '无法读取媒体文件。')
    }
  }

  function changeType(nextType: MomentType) {
    if (saving || nextType === type) return
    clearMedia()
    setType(nextType)
    setStatus('')
  }

  async function login(event: React.FormEvent) {
    event.preventDefault()
    setLoginMessage('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) setLoginMessage(loginError.message)
    else setLoginDrawerOpen(false)
    setPassword('')
  }

  async function add(event: React.FormEvent) {
    event.preventDefault()
    if (!session) return
    setSaving(true)
    setStatus('正在准备记录...')
    try {
      let mediaPath: string | undefined
      let prepared = file
      if (file && file.type.startsWith('image/')) prepared = await compressImage(file, setStatus)
      if (file && file.type.startsWith('video/')) prepared = validateVideo(file)
      if (prepared) mediaPath = await uploadTimelineMedia(session, prepared, (progress) => setStatus(`正在上传媒体 ${progress}%`))
      setStatus('正在保存记录...')
      const created = await createTimelineEntry(session, { type, title: title.trim(), body: body.trim() || undefined, date, time: time || undefined, tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean), mediaPath })
      onYearChange(created.date.slice(0, 4))
      onMonthChange('全年')
      onQueryChange('')
      setPendingRecordId(created.id)
      await onRefresh()
      resetForm()
      setDrawerOpen(false)
      setSuccess('新记录已加入时间线。')
      window.setTimeout(() => setSuccess(''), 3200)
    } catch (cause) {
      const message = cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string' ? cause.message : ''
      setStatus(message || (typeof cause === 'string' ? cause : '保存失败，请稍后重试。'))
    } finally {
      setSaving(false)
    }
  }

  return <main className="page-shell timeline-page">
    <header className="page-head"><div><p>MEMORIES</p><h1>时间线</h1></div>{canManage ? <button className="health-logout" type="button" onClick={() => void supabase.auth.signOut()}>退出登录</button> : permissionReady && !session ? <button className="timeline-login-trigger" type="button" onClick={() => { setLoginMessage(''); setLoginDrawerOpen(true) }}>管理员登录</button> : null}</header>
    <label className="search timeline-search"><IconSearch size={18} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索点滴" /></label>
    {permissionReady && session && !canManage ? <div className="timeline-login-note">当前账号没有时间线管理权限。<button className="health-logout" type="button" onClick={() => void supabase.auth.signOut()}>退出登录</button></div> : null}
    {error ? <p className="page-error" role="status">{error}<button type="button" onClick={() => void onRetry()}>重试</button></p> : null}
    {permissionError ? <p className="page-error" role="status">{permissionError}<button type="button" onClick={() => void onRetryPermission()}>重试</button></p> : null}
    {success ? <p className="timeline-success" role="status">{success}</p> : null}
    <div className="year-tabs">{years.map((item) => <button key={item} className={item === year ? 'active' : ''} type="button" onClick={() => onYearChange(item)}>{item}</button>)}</div>
    <div className="month-tabs">{months.map((item) => <button key={item} className={item === month ? 'active' : ''} type="button" onClick={() => onMonthChange(item)}>{item}</button>)}</div>
    <p className="result-count">{year} 年 · {month} · {visible.length} 条记录</p>
    <section className="timeline-list">{visible.map((moment) => <div className="timeline-item" key={moment.id} ref={moment.id === pendingRecordId ? recordRef : undefined}><MomentCard moment={moment} onOpen={onOpen} />{canManage ? <button className="health-delete timeline-delete" type="button" onClick={() => void onDelete(moment.id)} aria-label={`删除${moment.title}`}>删除</button> : null}</div>)}</section>
    {!visible.length ? <div className="empty-state">这一段时间，还没有留下记录。</div> : null}
    {canManage ? <button className="timeline-add" type="button" onClick={() => { setSuccess(''); setDrawerOpen(true) }} aria-label="新增时间线记录" title="新增记录"><IconPlus size={24} /></button> : null}
    {drawerOpen ? <div className="timeline-drawer-layer" role="presentation"><form className="timeline-drawer" onSubmit={add} aria-label="新增时间线记录"><div className="timeline-drawer-handle" /><header><h2>新增记录</h2><button className="timeline-drawer-close" type="button" onClick={requestClose} disabled={saving} aria-label="关闭新增记录"><IconClose size={18} /></button></header><fieldset disabled={saving}><div className="timeline-type-tabs">{typeOptions.map(({ id, label, Icon }) => <button key={id} type="button" className={type === id ? 'active' : ''} onClick={() => changeType(id)}><Icon size={16} />{label}</button>)}</div><label>标题<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这一刻起个名字" maxLength={160} required /></label><div className="timeline-date-fields"><label>日期<input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label><label>时间<input type="time" value={time} onChange={(event) => setTime(event.target.value)} /></label></div><label>记录<textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="记录一些点滴（可选）" maxLength={5000} /></label><label>标签<input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="用逗号分隔" /></label>{type !== 'text' ? <div className="timeline-media-field">{file && preview ? <div className="timeline-media-preview"><img src={preview} alt="已选媒体缩略图" />{type === 'video' ? <span><IconVideo size={15} />视频</span> : null}<div><strong>{file.name}</strong><button type="button" onClick={clearMedia}>移除</button></div></div> : <button className="timeline-media-picker" type="button" onClick={() => fileInput.current?.click()}><selectedType.Icon size={20} /><span>选择{selectedType.label}</span><small>{type === 'photo' ? '将自动压缩后上传' : '原文件上传，最大 45MB'}</small></button>}<input ref={fileInput} className="sr-only" type="file" accept={type === 'photo' ? 'image/*' : 'video/*'} onChange={(event) => void selectFile(event.target.files?.[0] ?? null)} required={!file} /></div> : null}</fieldset>{status ? <p className={`timeline-drawer-status ${saving ? '' : 'is-error'}`} role="status">{status}</p> : null}<button className="timeline-save" type="submit" disabled={saving}>{saving ? status || '保存中...' : '保存记录'}</button></form></div> : null}
    {loginDrawerOpen ? <div className="timeline-drawer-layer" role="presentation"><form className="timeline-drawer timeline-login-drawer" onSubmit={login} aria-label="管理员登录"><div className="timeline-drawer-handle" /><header><div><h2>管理员登录</h2><p>登录后可新增和删除时间线记录。</p></div><button className="timeline-drawer-close" type="button" onClick={() => setLoginDrawerOpen(false)} aria-label="关闭管理员登录"><IconClose size={18} /></button></header><fieldset><label>邮箱<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="管理员邮箱" autoComplete="email" required /></label><label>密码<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="密码" autoComplete="current-password" required /></label></fieldset>{loginMessage ? <p className="timeline-drawer-status is-error" role="status">{loginMessage}</p> : null}<button className="timeline-save" type="submit">登录</button></form></div> : null}
  </main>
}
