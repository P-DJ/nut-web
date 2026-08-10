import { useEffect } from 'react'
import { formatMomentDateTime } from '../lib/formatDate'
import { IconClose } from './Icons'
import type { Moment } from '../types'

interface MediaViewerProps { moment: Moment | null; onClose: () => void }

export function MediaViewer({ moment, onClose }: MediaViewerProps) {
  useEffect(() => {
    if (!moment) return

    const { body, documentElement } = document
    const scrollY = window.scrollY
    const previous = {
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth

    body.style.overflow = 'hidden'
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.width = '100%'
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      body.style.overflow = previous.overflow
      body.style.paddingRight = previous.paddingRight
      body.style.position = previous.position
      body.style.top = previous.top
      body.style.width = previous.width
      window.scrollTo(0, scrollY)
    }
  }, [moment])

  if (!moment) return null
  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={moment.title}>
      <button className="viewer-close" type="button" aria-label="关闭" onClick={onClose}><IconClose size={20} /></button>
      <section className="viewer-panel">
        {moment.type === 'video' && moment.media ? <video src={moment.media} controls autoPlay playsInline /> : null}
        {moment.type === 'photo' && moment.media ? <img src={moment.media} alt={moment.title} /> : null}
        {moment.type === 'text' ? <div className="viewer-text">{moment.body}</div> : null}
        <div className="viewer-caption"><h2>{moment.title}</h2><p>{formatMomentDateTime(moment.date, moment.time)}</p></div>
      </section>
    </div>
  )
}
