import type { Session } from '@supabase/supabase-js'
import type { HealthCategory, HealthEntry } from '../types'

const apiUrl = import.meta.env.VITE_HEALTH_API_URL ?? 'http://localhost:8080'

type ApiHealthCategory = 'BATH' | 'DEWORM' | 'CYCLE'

interface ApiHealthEntry {
  id: string
  category: ApiHealthCategory
  date: string
  note: string | null
}

const categoryToApi: Record<HealthCategory, ApiHealthCategory> = {
  bath: 'BATH',
  deworm: 'DEWORM',
  cycle: 'CYCLE',
}

const categoryFromApi: Record<ApiHealthCategory, HealthCategory> = {
  BATH: 'bath',
  DEWORM: 'deworm',
  CYCLE: 'cycle',
}

function headers(session: Session | null) {
  return session
    ? { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

async function request<T>(session: Session | null, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { ...headers(session), ...init?.headers },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(error?.message ?? '健康档案暂时无法同步，请稍后重试。')
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

function toEntry(entry: ApiHealthEntry): HealthEntry {
  return { ...entry, category: categoryFromApi[entry.category], note: entry.note ?? undefined }
}

export async function getHealthEntries(session: Session | null) {
  const entries = await request<ApiHealthEntry[]>(session, '/api/health')
  return entries.map(toEntry)
}

export async function createHealthEntry(session: Session | null, entry: Omit<HealthEntry, 'id'>) {
  const created = await request<ApiHealthEntry>(session, '/api/health', {
    method: 'POST',
    body: JSON.stringify({ ...entry, category: categoryToApi[entry.category] }),
  })
  return toEntry(created)
}

export function deleteHealthEntry(session: Session | null, id: string) {
  return request<void>(session, `/api/health/${id}`, { method: 'DELETE' })
}
