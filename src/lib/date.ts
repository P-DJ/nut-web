const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function parseDate(iso: string): Date {
  return new Date(iso)
}

export function formatMomentDate(iso: string): string {
  const d = parseDate(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const weekday = WEEKDAYS[d.getDay()]
  return `${month}月${day}日 · ${weekday}`
}

export function formatMomentDateTime(iso: string): string {
  const d = parseDate(iso)
  const y = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${y}年${month}月${day}日 ${h}:${m}`
}
