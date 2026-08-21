import type { Session } from '@supabase/supabase-js'

import type { HealthCategory, HealthEntry, Moment } from '../../../../packages/shared/src/types'

const apiUrl = process.env.EXPO_PUBLIC_HEALTH_API_URL ?? 'http://localhost:8080'
export const maxVideoBytes = 45 * 1024 * 1024
const requestTimeoutMs = 10_000

type ApiMoment = Omit<Moment, 'body' | 'media' | 'mediaPath' | 'time'> & {
  body: string | null
  media: string | null
  mediaPath: string | null
  time: string | null
}

type ApiHealthCategory = 'BATH' | 'DEWORM' | 'CYCLE'
type ApiHealthEntry = Omit<HealthEntry, 'category' | 'note'> & { category: ApiHealthCategory; note: string | null }
type UploadAuthorization = { path: string; uploadUrl: string }

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

function headers(session: Session | null, json = true) {
  return {
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...(json ? { 'Content-Type': 'application/json' } : {}),
  }
}

async function request<T>(session: Session | null, path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs)
  let response: Response
  try {
    response = await fetch(`${apiUrl}${path}`, {
      ...init,
      headers: { ...headers(session), ...init?.headers },
      signal: controller.signal,
    })
  } catch (error) {
    if (controller.signal.aborted) throw new Error('请求超时，请确认后端服务和局域网地址可访问。')
    throw error
  } finally {
    clearTimeout(timeout)
  }
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(error?.message ?? `请求失败（HTTP ${response.status}）。`)
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}

function momentFromApi(item: ApiMoment): Moment {
  return { ...item, body: item.body ?? undefined, media: item.media ?? undefined, mediaPath: item.mediaPath ?? undefined, time: item.time ?? undefined }
}

function entryFromApi(item: ApiHealthEntry): HealthEntry {
  return { ...item, category: categoryFromApi[item.category], note: item.note ?? undefined }
}

export async function getTimeline() {
  return (await request<ApiMoment[]>(null, '/api/timeline')).map(momentFromApi)
}

export async function canManageTimeline(session: Session | null) {
  if (!session) return false
  return (await request<{ canManage: boolean }>(session, '/api/timeline/can-manage')).canManage
}

export function deleteTimelineEntry(session: Session, id: string) {
  return request<void>(session, `/api/timeline/${id}`, { method: 'DELETE' })
}

export async function createTimelineEntry(session: Session, moment: Omit<Moment, 'id' | 'media'>) {
  return momentFromApi(await request<ApiMoment>(session, '/api/timeline', { method: 'POST', body: JSON.stringify(moment) }))
}

export async function uploadTimelineMedia(session: Session, uri: string, contentType: string, fileName: string) {
  const authorization = await request<UploadAuthorization>(session, '/api/timeline/upload-url', {
    method: 'POST',
    body: JSON.stringify({ contentType, fileName }),
  })
  const source = await fetch(uri)
  const body = await source.blob()
  const response = await fetch(authorization.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, 'x-upsert': 'false' },
    body,
  })
  if (!response.ok) throw new Error(`媒体上传失败（HTTP ${response.status}）。`)
  return authorization.path
}

export async function getHealthEntries(session: Session) {
  return (await request<ApiHealthEntry[]>(session, '/api/health')).map(entryFromApi)
}

export async function createHealthEntry(session: Session, entry: Omit<HealthEntry, 'id'>) {
  const created = await request<ApiHealthEntry>(session, '/api/health', {
    method: 'POST',
    body: JSON.stringify({ ...entry, category: categoryToApi[entry.category] }),
  })
  return entryFromApi(created)
}

export function deleteHealthEntry(session: Session, id: string) {
  return request<void>(session, `/api/health/${id}`, { method: 'DELETE' })
}
