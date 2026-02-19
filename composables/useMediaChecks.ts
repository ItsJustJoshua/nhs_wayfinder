export function displayMediaUrl(val: any) {
  if (!val) return ''
  const s = String(val)
  const filename = s.split('/').pop() || s
  return filename.replace(/\.[^.]+$/, '')
}

export function isImageType(m: any) {
  if (!m) return false
  const t = String(m.media_type || '').toLowerCase()
  if (t.includes('image')) return true
  if (['2', 'image', 'img'].includes(t)) return true
  return /\.(png|jpe?g|gif|bmp|svg)$/i.test(String(m.media_url || ''))
}

export function isVideoType(m: any) {
  if (!m) return false
  const t = String(m.media_type || '').toLowerCase()
  if (t.includes('video')) return true
  if (['1', 'video', 'vid'].includes(t)) return true
  return /\.(mp4|webm|ogg|mov|mkv)$/i.test(String(m.media_url || ''))
}

export default function useMediaChecks() {
  return {
    displayMediaUrl,
    isImageType,
    isVideoType,
  }
}
