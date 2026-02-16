import { detectMimeFromMagic } from './mimeSignatures.js'
import { extensionFromMime, previewKindFromMime, sanitizeMime, type PreviewKind } from './mimeMappings.js'

export type DetectionSource = 'override' | 'hint' | 'magic' | 'text' | 'fallback'

export interface FileTypeResult {
  mime: string
  extension: string
  previewKind: PreviewKind
  source: DetectionSource
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
