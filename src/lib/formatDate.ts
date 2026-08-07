const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

export function formatMomentDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`
}

export function formatMomentDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
}
