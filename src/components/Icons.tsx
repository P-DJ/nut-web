interface IconProps {
  size?: number
  className?: string
}

export function IconPlus({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export function IconRotate({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M3 12a9 9 0 0 1 15-6.7M21 3v5h-5M21 12a9 9 0 0 1-15 6.7M3 21v-5h5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconPlay({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

export function IconClose({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function IconImage({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" />
      <path d="M21 15l-5-5-4 4-2-2-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconVideo({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 10l5-3v10l-5-3v-4z" fill="currentColor" />
    </svg>
  )
}

export function IconText({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconHome({ size = 22, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
}

export function IconTimeline({ size = 22, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" /><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function IconHeart({ size = 22, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><path d="M20.8 8.2c0 5-8.8 10.1-8.8 10.1S3.2 13.2 3.2 8.2A4.3 4.3 0 0 1 11 5.7l1 1.1 1-1.1a4.3 4.3 0 0 1 7.8 2.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
}

export function IconUser({ size = 22, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 21c.6-4 3.1-6 7.5-6s6.9 2 7.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function IconSearch({ size = 20, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.8" /><path d="m16 16 4.2 4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function IconBath({ size = 20, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><path d="M4 15h16v3a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-3ZM6 15v-3a6 6 0 0 1 12 0v3M5 6h.01M10 3h.01M16 6h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function IconShield({ size = 20, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><path d="M12 3 19 6v5c0 4.5-3 7.8-7 10-4-2.2-7-5.5-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M12 8v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}

export function IconLeaf({ size = 20, className }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden><path d="M20 4C11 4 5 7 5 14c0 3 2 5 5 5 7 0 10-6 10-15Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><path d="M4 21c3-5 6-7 11-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
}
