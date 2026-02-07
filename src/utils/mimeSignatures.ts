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

export function detectMimeFromMagic(bytes: Uint8Array): string | null {
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
