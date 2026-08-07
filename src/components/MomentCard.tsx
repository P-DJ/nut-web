import { formatMomentDate } from '../lib/formatDate'
import { useInView } from '../hooks/useInView'
import { IconPlay } from './Icons'
import type { Moment } from '../types'

interface MomentCardProps {
  moment: Moment
  index: number
  onOpen: (moment: Moment) => void
}

export function MomentCard({ moment, index, onOpen }: MomentCardProps) {
  const { ref, visible } = useInView<HTMLElement>()
  const dateLabel = formatMomentDate(moment.createdAt)
  const isMedia = moment.type === 'photo' || moment.type === 'video'
  const cover = moment.thumbnailUrl || moment.mediaUrl

  return (
    <article
      ref={ref}
      className={`moment-card moment-${moment.type} ${visible ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${Math.min(index * 50, 250)}ms` }}
      onClick={() => onOpen(moment)}
    >
      <div className="moment-meta">
        <time dateTime={moment.createdAt}>{dateLabel}</time>
        {moment.tags?.length ? (
          <div className="moment-tags">
            {moment.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>

      {isMedia && cover ? (
        <div className="moment-media">
          <img src={cover} alt={moment.title} loading="lazy" />
          {moment.type === 'video' ? (
            <div className="moment-play">
              <IconPlay size={22} />
            </div>
          ) : null}
          <div className="moment-media-fade" />
        </div>
      ) : null}

      <div className="moment-copy">
        <h2>{moment.title}</h2>
        {moment.body ? <p>{moment.body}</p> : null}
      </div>
    </article>
  )
}
