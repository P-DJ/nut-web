import { IconHeart, IconHome, IconTimeline, IconUser } from './Icons'
import type { PageId } from '../types'

const items = [
  { id: 'home', label: '首页', Icon: IconHome },
  { id: 'timeline', label: '时间线', Icon: IconTimeline },
  { id: 'health', label: '健康档案', Icon: IconHeart },
  { id: 'about', label: '关于坚果', Icon: IconUser },
] as const

interface BottomNavProps { active: PageId; onChange: (id: PageId) => void }
export function BottomNav({ active, onChange }: BottomNavProps) {
  return <nav className="bottom-nav" aria-label="主导航">{items.map(({ id, label, Icon }) => (
    <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => onChange(id)}>
      <Icon size={21} /><span>{label}</span>
    </button>
  ))}</nav>
}
