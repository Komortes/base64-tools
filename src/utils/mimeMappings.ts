export type PreviewKind = 'image' | 'pdf' | 'text' | 'audio' | 'video' | 'none'

export function sanitizeMime(mime: string): string {
  return mime.trim().toLowerCase()
}

export function previewKindFromMime(mime: string): PreviewKind {
  const normalized = sanitizeMime(mime)

  if (normalized.startsWith('image/')) {
    return 'image'
  }

  if (normalized === 'application/pdf') {
    return 'pdf'
  }

  if (normalized.startsWith('video/')) {
    return 'video'
  }

  if (normalized.startsWith('audio/')) {
    return 'audio'
  }

  if (
    normalized.startsWith('text/') ||
    normalized.includes('json') ||
    normalized.includes('xml') ||
    normalized.includes('javascript')
  ) {
    return 'text'
  }

  return 'none'
}

export function extensionFromMime(mime: string): string {
  const base = sanitizeMime(mime).split(';')[0]

  if (base === 'image/png') return 'png'
  if (base === 'image/jpeg') return 'jpg'
  if (base === 'image/gif') return 'gif'
  if (base === 'image/webp') return 'webp'
  if (base === 'application/pdf') return 'pdf'
  if (base === 'application/zip') return 'zip'
  if (base === 'application/json') return 'json'
  if (base === 'text/plain') return 'txt'
  if (base === 'text/csv') return 'csv'
  if (base === 'application/xml' || base === 'text/xml') return 'xml'
  if (base === 'audio/mpeg') return 'mp3'
  if (base === 'audio/ogg') return 'ogg'
  if (base === 'audio/wav') return 'wav'
  if (base === 'video/mp4') return 'mp4'
  if (base === 'video/webm') return 'webm'

  const slashIndex = base.indexOf('/')
  if (slashIndex !== -1) {
    return base.slice(slashIndex + 1)
  }

  return 'bin'
}
