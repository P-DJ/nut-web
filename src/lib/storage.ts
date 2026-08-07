import { demoMoments } from '../data/demo'
import type { Moment } from '../types'

const STORAGE_KEY = 'nut-moments-v1'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function loadMoments(): Moment[] {
  const storage = getStorage()

  if (!storage) return demoMoments

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return demoMoments
    const parsed = JSON.parse(raw) as Moment[]
    if (!Array.isArray(parsed) || parsed.length === 0) return demoMoments
    return parsed
  } catch {
    return demoMoments
  }
}

export function saveMoments(moments: Moment[]) {
  const storage = getStorage()
  if (!storage) return

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(moments))
  } catch {
    // Ignore storage failures in privacy-restricted browsers.
  }
}

export function resetMoments() {
  const storage = getStorage()
  if (storage) {
    try {
      storage.removeItem(STORAGE_KEY)
    } catch {
      // Ignore storage failures in privacy-restricted browsers.
    }
  }

  return demoMoments
}
