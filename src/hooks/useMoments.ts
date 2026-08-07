import { useCallback, useEffect, useState } from 'react'
import { loadMoments, resetMoments, saveMoments } from '../lib/storage'
import type { Moment, UploadPayload } from '../types'
import { uploadMedia } from '../lib/cos'
import type { UploadProgress } from '../types'

function createId() {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function useMoments() {
  const [moments, setMoments] = useState<Moment[]>(() => loadMoments())
  const [progress, setProgress] = useState<UploadProgress>({
    percent: 0,
    status: 'idle',
  })

  useEffect(() => {
    saveMoments(moments)
  }, [moments])

  const addMoment = useCallback(async (payload: UploadPayload) => {
    setProgress({ percent: 0, status: 'uploading', message: '准备中…' })

    let mediaUrl: string | undefined
    let thumbnailUrl: string | undefined

    try {
      if (payload.file && payload.type !== 'text') {
        const result = await uploadMedia(payload.file, setProgress)
        mediaUrl = result.url
        if (payload.type === 'video') {
          thumbnailUrl = undefined
        }
      }

      const next: Moment = {
        id: createId(),
        type: payload.type,
        title: payload.title.trim() || (payload.type === 'text' ? '一段文字' : '新的瞬间'),
        body: payload.body?.trim() || undefined,
        mediaUrl,
        thumbnailUrl,
        createdAt: new Date().toISOString(),
        tags: payload.tags,
      }

      setMoments((prev) => [next, ...prev])
      setProgress({ percent: 100, status: 'done', message: '已记录' })
      return next
    } catch (error) {
      const message = error instanceof Error ? error.message : '上传失败'
      setProgress({ percent: 0, status: 'error', message })
      throw error
    }
  }, [])

  const removeMoment = useCallback((id: string) => {
    setMoments((prev) => prev.filter((m) => m.id !== id))
  }, [])

  const restoreDemo = useCallback(() => {
    const demo = resetMoments()
    setMoments(demo)
  }, [])

  const clearProgress = useCallback(() => {
    setProgress({ percent: 0, status: 'idle' })
  }, [])

  return {
    moments,
    progress,
    addMoment,
    removeMoment,
    restoreDemo,
    clearProgress,
  }
}
