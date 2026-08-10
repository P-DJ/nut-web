import { healthContent } from '../content/health/content'
import { formatRecordDate } from '../lib/formatDate'
import { IconBath, IconLeaf, IconShield } from './Icons'
import type { HealthCategory } from '../types'

const categories: { id: HealthCategory; title: string; Icon: typeof IconBath }[] = [
  { id: 'bath', title: '洗澡记录', Icon: IconBath },
  { id: 'deworm', title: '驱虫记录', Icon: IconShield },
  { id: 'cycle', title: '生理周期', Icon: IconLeaf },
]

export function Health() {
  return (
    <main className="page-shell health-page">
      <header className="page-head"><div><p>CARE LOG</p><h1>健康档案</h1></div></header>
      <p className="page-lead">把每一次细心照料，都留在这里。</p>
      <section className="health-list">
        {categories.map(({ id, title, Icon }) => {
          const entries = healthContent
            .filter((entry) => entry.category === id)
            .sort((a, b) => b.date.localeCompare(a.date))

          return (
            <article className="health-card" key={id}>
              <div className="health-card-head">
                <span className="health-icon"><Icon size={20} /></span>
                <h2>{title}</h2>
                <span className="health-total">{entries.length} 次</span>
              </div>
              <ol className="health-history">
                {entries.map((entry) => (
                  <li key={entry.id}>
                    <time dateTime={entry.date}>{formatRecordDate(entry.date)}</time>
                    {entry.note ? <p>{entry.note}</p> : null}
                  </li>
                ))}
              </ol>
            </article>
          )
        })}
      </section>
    </main>
  )
}
