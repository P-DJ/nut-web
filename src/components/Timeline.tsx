import { useMemo } from 'react'
import { IconSearch } from './Icons'
import { MomentCard } from './MomentCard'
import type { Moment } from '../types'

interface TimelineProps {
  moments: Moment[]
  year: string
  month: string
  query: string
  onYearChange: (year: string) => void
  onMonthChange: (month: string) => void
  onQueryChange: (query: string) => void
  onOpen: (moment: Moment) => void
}
const months = ['全年', '1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

export function Timeline({ moments, year, month, query, onYearChange, onMonthChange, onQueryChange, onOpen }: TimelineProps) {
  const years = [...new Set(moments.map((moment) => moment.date.slice(0, 4)))].sort((a, b) => b.localeCompare(a))
  const visible = useMemo(() => moments.filter((moment) => {
    const [momentYear, momentMonth] = moment.date.split('-')
    const matchesYear = momentYear === year
    const matchesMonth = month === '全年' || Number(momentMonth) === Number(month.replace('月', ''))
    const text = `${moment.title} ${moment.body ?? ''} ${moment.tags.join(' ')}`.toLowerCase()
    return matchesYear && matchesMonth && text.includes(query.trim().toLowerCase())
  }), [moments, month, query, year])

  return <main className="page-shell timeline-page">
    <header className="page-head"><div><p>MEMORIES</p><h1>时间线</h1></div><label className="search"><IconSearch size={18} /><input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="搜索点滴" /></label></header>
    <div className="year-tabs">{years.map((item) => <button key={item} className={item === year ? 'active' : ''} type="button" onClick={() => onYearChange(item)}>{item}</button>)}</div>
    <div className="month-tabs">{months.map((item) => <button key={item} className={item === month ? 'active' : ''} type="button" title={item === '全年' ? '查看当前年份的全部月份' : undefined} onClick={() => onMonthChange(item)}>{item}</button>)}</div>
    <p className="result-count">{year} 年 · {month} · {visible.length} 条记录</p>
    <section className="timeline-list">{visible.map((moment) => <MomentCard key={moment.id} moment={moment} onOpen={onOpen} />)}</section>
    {!visible.length ? <div className="empty-state">这一段时间，还没有留下记录。</div> : null}
  </main>
}
