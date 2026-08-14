import type { Session } from '@supabase/supabase-js'
import type { Moment, MomentType } from '../types'

const apiUrl = import.meta.env.VITE_HEALTH_API_URL ?? 'http://localhost:8080'
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024
export const MAX_VIDEO_BYTES = 45 * 1024 * 1024

interface ApiMoment { id: string; type: MomentType; title: string; body: string | null; media: string | null; mediaPath: string | null; date: string; time: string | null; tags: string[] }
interface UploadUrl { path: string; uploadUrl: string }

function authHeaders(session: Session | null, json = true) {
  return { ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(json ? { 'Content-Type': 'application/json' } : {}) }
}
async function request<T>(session: Session | null, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { ...authHeaders(session), ...init?.headers } })
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string } | null
    throw new Error(error?.message ?? '时间线暂时无法同步，请稍后重试。')
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>
}
function momentFromApi(item: ApiMoment): Moment { return { ...item, body: item.body ?? undefined, media: item.media ?? undefined, mediaPath: item.mediaPath ?? undefined, time: item.time ?? undefined } }

export async function getTimeline() { return (await request<ApiMoment[]>(null, '/api/timeline')).map(momentFromApi) }
export async function canManageTimeline(session: Session | null) {
  if (!session) return false
  return (await request<{ canManage: boolean }>(session, '/api/timeline/can-manage')).canManage
}
export async function createTimelineEntry(session: Session, moment: Omit<Moment, 'id' | 'media'> & { mediaPath?: string }) {
  return momentFromApi(await request<ApiMoment>(session, '/api/timeline', { method: 'POST', body: JSON.stringify(moment) }))
}
export function deleteTimelineEntry(session: Session, id: string) { return request<void>(session, `/api/timeline/${id}`, { method: 'DELETE' }) }
export async function uploadTimelineMedia(session: Session, file: File, onProgress: (progress: number) => void) {
  const authorization = await request<UploadUrl>(session, '/api/timeline/upload-url', { method: 'POST', body: JSON.stringify({ contentType: file.type, fileName: file.name }) })
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', authorization.uploadUrl)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('Content-Type', file.type)
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100)) }
    xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`媒体上传失败（HTTP ${xhr.status}），请重试。`))
    xhr.onerror = () => reject(new Error('媒体上传失败，请检查网络后重试。'))
    xhr.send(file)
  })
  return authorization.path
}
