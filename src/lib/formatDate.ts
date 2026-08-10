const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

function dateFromInput(date: string): Date {
  return new Date(`${date}T12:00:00`)
}

export function formatMomentDate(date: string): string {
  const d = dateFromInput(date)
  return `${d.getMonth() + 1}月${d.getDate()}日 · ${weekdays[d.getDay()]}`
}

export function formatMomentDateTime(date: string, time?: string): string {
  const d = dateFromInput(date)
  const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  return time ? `${label} ${time}` : label
}

export function formatRecordDate(date: string): string {
  const d = dateFromInput(date)
  return `${d.getFullYear()} 年 ${String(d.getMonth() + 1).padStart(2, '0')} 月 ${String(d.getDate()).padStart(2, '0')} 日`
}
