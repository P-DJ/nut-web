import { MAX_IMAGE_BYTES, MAX_VIDEO_BYTES } from './timelineApi'

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const image = new Image(); const url = URL.createObjectURL(file); image.onload = () => { URL.revokeObjectURL(url); resolve(image) }; image.onerror = reject; image.src = url })
}

export async function compressImage(file: File, onStatus: (status: string) => void): Promise<File> {
  try {
    onStatus('正在压缩图片...')
    const image = await loadImage(file)
    const scale = Math.min(1, 2560 / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth * scale); canvas.height = Math.round(image.naturalHeight * scale)
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
    let quality = 0.9
    let blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality))
    while (blob && blob.size > MAX_IMAGE_BYTES && quality > 0.45) { quality -= 0.1; blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality)) }
    if (!blob || blob.size > MAX_IMAGE_BYTES) throw new Error('图片压缩后仍超过 2MB，请选择尺寸更小的图片。')
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' })
  } catch (cause) {
    const detail = cause && typeof cause === 'object' && 'message' in cause && typeof cause.message === 'string' ? cause.message : ''
    throw new Error(detail ? `图片压缩失败：${detail}` : '图片压缩失败。请改用 JPEG、PNG 或 WebP 图片后重试。')
  }
}

export function validateVideo(file: File): File {
  if (file.size > MAX_VIDEO_BYTES) throw new Error('视频文件超过 45MB，无法上传。')
  return file
}
