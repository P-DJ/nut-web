import { formatMomentDate } from '../lib/formatDate'
import { IconPlay } from './Icons'
import type { Moment } from '../types'

interface MomentCardProps {
  moment: Moment
  onOpen: (moment: Moment) => void
}

export function MomentCard({ moment, onOpen }: MomentCardProps) {
  return (
    <article className={`moment-card moment-${moment.type}`}>
      <time dateTime={moment.date}>{formatMomentDate(moment.date)}</time>
      <button type="button" className="moment-open" onClick={() => onOpen(moment)}>
        {moment.media ? <img src={moment.media} alt={moment.title} /> : <div className="text-moment-mark">日记</div>}
        {moment.type === 'video' ? <span className="play-mark"><IconPlay size={18} /></span> : null}
      </button>
      <div className="moment-copy">
        <h2>{moment.title}</h2>
        {moment.body ? <p>{moment.body}</p> : null}
        <div className="moment-tags">{moment.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      </div>
    </article>
  )
}
