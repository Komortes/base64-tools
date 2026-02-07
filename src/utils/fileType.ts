export type PreviewKind = 'image' | 'pdf' | 'text' | 'audio' | 'video' | 'none'

type DetectionSource = 'override' | 'hint' | 'magic' | 'text' | 'fallback'

export interface FileTypeResult {
  mime: string
  extension: string
  previewKind: PreviewKind
  source: DetectionSource
}

function startsWith(bytes: Uint8Array, signature: number[], offset = 0): boolean {
  if (bytes.length < offset + signature.length) {
    return false
  }

  for (let i = 0; i < signature.length; i += 1) {
    if (bytes[offset + i] !== signature[i]) {
      return false
    }
  }

  return true
}

function hasAsciiAt(bytes: Uint8Array, offset: number, value: string): boolean {
  if (bytes.length < offset + value.length) {
    return false
  }

  for (let i = 0; i < value.length; i += 1) {
    if (bytes[offset + i] !== value.charCodeAt(i)) {
      return false
    }
  }

  return true
}

function detectMimeFromMagic(bytes: Uint8Array): string | null {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    return 'image/png'
  }

  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg'
  }

  if (hasAsciiAt(bytes, 0, 'GIF87a') || hasAsciiAt(bytes, 0, 'GIF89a')) {
    return 'image/gif'
  }

  if (hasAsciiAt(bytes, 0, 'RIFF') && hasAsciiAt(bytes, 8, 'WEBP')) {
    return 'image/webp'
  }

  if (hasAsciiAt(bytes, 0, '%PDF-')) {
    return 'application/pdf'
  }

  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04])) {
    return 'application/zip'
  }

  if (hasAsciiAt(bytes, 4, 'ftyp')) {
    return 'video/mp4'
  }

  if (startsWith(bytes, [0x49, 0x44, 0x33]) || startsWith(bytes, [0xff, 0xfb])) {
    return 'audio/mpeg'
  }

  if (hasAsciiAt(bytes, 0, 'OggS')) {
    return 'audio/ogg'
  }

  if (hasAsciiAt(bytes, 0, 'RIFF') && hasAsciiAt(bytes, 8, 'WAVE')) {
    return 'audio/wav'
  }

  if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) {
    return 'video/webm'
  }

  if (startsWith(bytes, [0x7b]) || startsWith(bytes, [0x5b])) {
    return 'application/json'
  }

  return null
}

function looksLikeText(bytes: Uint8Array): boolean {
  const sample = bytes.slice(0, Math.min(bytes.length, 2048))
  if (!sample.length) {
    return false
  }

  let printable = 0
  let nonPrintable = 0

  for (const byte of sample) {
    if (byte === 9 || byte === 10 || byte === 13 || (byte >= 32 && byte <= 126)) {
      printable += 1
    } else if (byte === 0) {
      nonPrintable += 2
    } else if (byte >= 128) {
      printable += 1
    } else {
      nonPrintable += 1
    }
  }

  return printable >= nonPrintable * 4
}

function sanitizeMime(mime: string): string {
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

export function detectFileType(
  bytes: Uint8Array,
  hintedMime?: string,
  overrideMime?: string,
): FileTypeResult {
  if (overrideMime && overrideMime.trim()) {
    const mime = sanitizeMime(overrideMime)
    return {
      mime,
      extension: extensionFromMime(mime),
      previewKind: previewKindFromMime(mime),
      source: 'override',
    }
  }

  if (hintedMime && hintedMime.trim()) {
    const mime = sanitizeMime(hintedMime)
    return {
      mime,
      extension: extensionFromMime(mime),
      previewKind: previewKindFromMime(mime),
      source: 'hint',
    }
  }

  const magicMime = detectMimeFromMagic(bytes)
  if (magicMime) {
    return {
      mime: magicMime,
      extension: extensionFromMime(magicMime),
      previewKind: previewKindFromMime(magicMime),
      source: 'magic',
    }
  }

  if (looksLikeText(bytes)) {
    const mime = 'text/plain;charset=utf-8'
    return {
      mime,
      extension: extensionFromMime(mime),
      previewKind: 'text',
      source: 'text',
    }
  }

  const mime = 'application/octet-stream'
  return {
    mime,
    extension: 'bin',
    previewKind: 'none',
    source: 'fallback',
  }
}
