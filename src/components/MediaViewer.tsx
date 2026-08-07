import { formatMomentDateTime } from '../lib/formatDate'
import { IconClose } from './Icons'
import type { Moment } from '../types'

interface MediaViewerProps {
  moment: Moment | null
  onClose: () => void
}

export function MediaViewer({ moment, onClose }: MediaViewerProps) {
  if (!moment) return null

  return (
    <div className="viewer animate-fade-in" role="dialog" aria-modal="true">
      <button className="viewer-close" type="button" aria-label="关闭" onClick={onClose}>
        <IconClose size={22} />
      </button>

      <div className="viewer-panel animate-slide-up">
        {moment.type === 'photo' && moment.mediaUrl ? (
          <img src={moment.mediaUrl} alt={moment.title} />
        ) : null}

        {moment.type === 'video' && moment.mediaUrl ? (
          <video src={moment.mediaUrl} controls autoPlay playsInline />
        ) : null}

        {moment.type === 'text' ? (
          <div className="viewer-text">
            <p>{moment.body}</p>
          </div>
        ) : null}

        <div className="viewer-caption">
          <h3>{moment.title}</h3>
          {moment.type !== 'text' && moment.body ? <p>{moment.body}</p> : null}
          <time dateTime={moment.createdAt}>{formatMomentDateTime(moment.createdAt)}</time>
        </div>
      </div>
    </div>
  )
}
