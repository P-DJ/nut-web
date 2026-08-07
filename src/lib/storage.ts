import { demoMoments } from '../data/demo'
import type { Moment } from '../types'

const STORAGE_KEY = 'nut-moments-v1'

export function loadMoments(): Moment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return demoMoments
    const parsed = JSON.parse(raw) as Moment[]
    if (!Array.isArray(parsed) || parsed.length === 0) return demoMoments
    return parsed
  } catch {
    return demoMoments
  }
}

export function saveMoments(moments: Moment[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(moments))
}

export function resetMoments() {
  localStorage.removeItem(STORAGE_KEY)
  return demoMoments
}
