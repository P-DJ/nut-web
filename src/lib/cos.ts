import type { UploadProgress } from '../types'

const bucket = import.meta.env.VITE_COS_BUCKET as string | undefined
const region = import.meta.env.VITE_COS_REGION as string | undefined

/** 仅检查是否填写了 COS 相关 env（实际上传需后续接后端签名） */
export function isCosConfigured(): boolean {
  return Boolean(bucket && region)
}

async function uploadLocalDemo(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  onProgress?.({ percent: 10, status: 'uploading', message: 'Demo 模式：本地预览' })
  await new Promise((r) => setTimeout(r, 280))
  onProgress?.({ percent: 55, status: 'uploading', message: '写入本地预览…' })
  await new Promise((r) => setTimeout(r, 320))
  const url = URL.createObjectURL(file)
  onProgress?.({ percent: 100, status: 'done', message: '上传完成（本地 Demo）' })
  return url
}

/**
 * 上传媒体。当前 Demo 使用本地 blob URL。
 * 后续可在此接入后端签名的 COS 直传 API。
 */
export async function uploadMedia(
  file: File,
  onProgress?: (progress: UploadProgress) => void,
): Promise<{ url: string; mode: 'cos' | 'demo' }> {
  if (isCosConfigured()) {
    onProgress?.({
      percent: 0,
      status: 'uploading',
      message: 'COS 直传待接入，暂用本地预览…',
    })
  }

  const url = await uploadLocalDemo(file, onProgress)
  return { url, mode: 'demo' }
}
