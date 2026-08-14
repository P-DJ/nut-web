import { useEffect } from 'react'

export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const scrollY = window.scrollY
    const previous = {
      overflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    }
    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.documentElement.style.overflow = previous.overflow
      document.body.style.overflow = previous.bodyOverflow
      document.body.style.position = previous.position
      document.body.style.top = previous.top
      document.body.style.width = previous.width
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
