export type MomentType = 'photo' | 'video' | 'text'

export interface Moment {
  id: string
  type: MomentType
  title: string
  body?: string
  mediaUrl?: string
  thumbnailUrl?: string
  createdAt: string
  tags?: string[]
}

export interface UploadPayload {
  type: MomentType
  title: string
  body?: string
  file?: File | null
  tags?: string[]
}

export interface UploadProgress {
  percent: number
  status: 'idle' | 'uploading' | 'done' | 'error'
  message?: string
}
