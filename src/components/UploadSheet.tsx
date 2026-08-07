import { useRef, useState, type FormEvent } from 'react'
import { IconClose, IconImage, IconText, IconVideo } from './Icons'
import type { MomentType, UploadPayload, UploadProgress } from '../types'
import { isCosConfigured } from '../lib/cos'

interface UploadSheetProps {
  open: boolean
  progress: UploadProgress
  onClose: () => void
  onSubmit: (payload: UploadPayload) => Promise<unknown>
}

const types: { id: MomentType; label: string; Icon: typeof IconImage }[] = [
  { id: 'photo', label: '照片', Icon: IconImage },
  { id: 'video', label: '视频', Icon: IconVideo },
  { id: 'text', label: '文字', Icon: IconText },
]

export function UploadSheet({ open, progress, onClose, onSubmit }: UploadSheetProps) {
  const [type, setType] = useState<MomentType>('photo')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setTitle('')
    setBody('')
    setFile(null)
    setPreview(null)
    setType('photo')
    setBusy(false)
  }

  const handleClose = () => {
    if (busy) return
    reset()
    onClose()
  }

  const onPickFile = (next: File | null) => {
    setFile(next)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(next ? URL.createObjectURL(next) : null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (busy) return
    if (type !== 'text' && !file) return
    if (type === 'text' && !body.trim() && !title.trim()) return

    setBusy(true)
    try {
      await onSubmit({ type, title, body, file })
      reset()
      onClose()
    } catch {
      setBusy(false)
    }
  }

  const accept =
    type === 'photo' ? 'image/*' : type === 'video' ? 'video/*' : undefined

  if (!open) return null

  return (
    <div className="sheet-root animate-fade-in">
      <button className="sheet-backdrop" type="button" aria-label="关闭" onClick={handleClose} />

      <form className="sheet animate-slide-up" onSubmit={handleSubmit}>
        <div className="sheet-handle" />
        <div className="sheet-head">
          <h2>记录新瞬间</h2>
          <button type="button" className="icon-btn" onClick={handleClose} aria-label="关闭">
            <IconClose size={18} />
          </button>
        </div>

        <p className="sheet-hint">
          {isCosConfigured()
            ? '媒体将上传到腾讯云 COS'
            : '当前为 Demo 模式：媒体先存本地预览，配置 .env 后即可直传 COS'}
        </p>

        <div className="type-row">
          {types.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`type-chip ${type === id ? 'active' : ''}`}
              onClick={() => {
                setType(id)
                onPickFile(null)
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {type !== 'text' ? (
          <button
            type="button"
            className="file-drop"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              type === 'photo' ? (
                <img src={preview} alt="预览" />
              ) : (
                <video src={preview} muted />
              )
            ) : (
              <span>
                点击选择{type === 'photo' ? '照片' : '视频'}
                <small>支持从相册上传</small>
              </span>
            )}
          </button>
        ) : null}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
        />

        <label className="field">
          <span>标题</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="给这一刻起个名字"
            maxLength={40}
          />
        </label>

        <label className="field">
          <span>文字</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="写下今天的点滴…"
            rows={4}
            maxLength={500}
          />
        </label>

        {progress.status === 'uploading' || progress.status === 'error' ? (
          <div className={`upload-progress ${progress.status}`}>
            <div className="upload-bar">
              <div className="upload-bar-fill" style={{ width: `${progress.percent}%` }} />
            </div>
            <p>{progress.message}</p>
          </div>
        ) : null}

        <button
          className="primary-btn"
          type="submit"
          disabled={busy || (type !== 'text' && !file)}
        >
          {busy ? '上传中…' : '保存这一刻'}
        </button>
      </form>
    </div>
  )
}
