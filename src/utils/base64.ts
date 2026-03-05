const BASE64_STD_REGEX = /^[A-Za-z0-9+/]*={0,2}$/
const BASE64_URL_REGEX = /^[A-Za-z0-9_-]*={0,2}$/
const DEFAULT_BASE64_CHUNK_SIZE = 48 * 1024
const DEFAULT_BLOB_READ_CHUNK_SIZE = 1024 * 1024

export type Base64InputFormat = 'standard' | 'url-safe' | 'mixed'

export interface NormalizationOptions {
  stripWhitespace?: boolean
  normalizeUrlSafe?: boolean
  addPadding?: boolean
}

export interface ValidationResult {
  isValid: boolean
  format: Base64InputFormat
  normalized: string
  errors: string[]
  warnings: string[]
}

function cleanInput(value: string, stripWhitespace: boolean): string {
  return stripWhitespace ? value.replace(/\s+/g, '') : value
}

function inferFormat(value: string): Base64InputFormat {
  const hasStd = /[+/]/.test(value)
  const hasUrl = /[-_]/.test(value)

  if (hasStd && hasUrl) {
    return 'mixed'
  }

  if (hasUrl) {
    return 'url-safe'
  }

  return 'standard'
}

function normalizeChunkSize(size: number): number {
  if (size < 3) {
    return 3
  }

  return size - (size % 3)
}

function bytesToBinaryString(bytes: Uint8Array): string {
  const chars = new Array<string>(bytes.length)
  for (let i = 0; i < bytes.length; i += 1) {
    chars[i] = String.fromCharCode(bytes[i])
  }

  return chars.join('')
}

function mergeBytes(prefix: Uint8Array, suffix: Uint8Array): Uint8Array {
  if (!prefix.length) {
    return suffix
  }

  if (!suffix.length) {
    return prefix
  }

  const merged = new Uint8Array(prefix.length + suffix.length)
  merged.set(prefix, 0)
  merged.set(suffix, prefix.length)
  return merged
}

export function normalizeBase64Input(
  input: string,
  options: NormalizationOptions = {},
): string {
  const {
    stripWhitespace = true,
    normalizeUrlSafe = true,
    addPadding = true,
  } = options

  let normalized = cleanInput(input, stripWhitespace)

  if (normalizeUrlSafe) {
    normalized = normalized.replace(/-/g, '+').replace(/_/g, '/')
  }

  if (addPadding && normalized.length % 4 !== 0) {
    normalized += '='.repeat(4 - (normalized.length % 4))
  }

  return normalized
}

export function bytesToBase64(bytes: Uint8Array, chunkSize = DEFAULT_BASE64_CHUNK_SIZE): string {
  if (!bytes.length) {
    return ''
  }

  const safeChunkSize = normalizeChunkSize(chunkSize)
  const parts: string[] = []

  for (let offset = 0; offset < bytes.length; offset += safeChunkSize) {
    const chunk = bytes.subarray(offset, offset + safeChunkSize)
    parts.push(btoa(bytesToBinaryString(chunk)))
  }

  return parts.join('')
}

export interface BlobToBase64Options {
  readChunkSize?: number
  onProgress?: (processedBytes: number, totalBytes: number) => void
}

export async function blobToBase64(
  blob: Blob,
  options: BlobToBase64Options = {},
): Promise<string> {
  if (!blob.size) {
    return ''
  }

  const readChunkSize = normalizeChunkSize(options.readChunkSize ?? DEFAULT_BLOB_READ_CHUNK_SIZE)
  const encodedParts: string[] = []
  let offset = 0
  let carry = new Uint8Array(0)

  while (offset < blob.size) {
    const nextOffset = Math.min(offset + readChunkSize, blob.size)
    const chunkBytes = new Uint8Array(await blob.slice(offset, nextOffset).arrayBuffer())
    const merged = mergeBytes(carry, chunkBytes)

    const remainderLength = merged.length % 3
    const encodeLength = merged.length - remainderLength

    if (encodeLength > 0) {
      encodedParts.push(bytesToBase64(merged.subarray(0, encodeLength)))
    }

    carry = remainderLength > 0 ? merged.slice(encodeLength) : new Uint8Array(0)
    offset = nextOffset
    options.onProgress?.(offset, blob.size)
  }

  if (carry.length) {
    encodedParts.push(bytesToBase64(carry))
  }

  return encodedParts.join('')
}

export function base64ToBytes(input: string, options: NormalizationOptions = {}): Uint8Array {
  const normalized = normalizeBase64Input(input, options)
  const binary = atob(normalized)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

export function encodeTextToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  return bytesToBase64(bytes)
}

export function decodeBase64ToText(
  base64: string,
  options: NormalizationOptions = {},
): string {
  const bytes = base64ToBytes(base64, options)
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

export function toUrlSafeBase64(input: string): string {
  return input.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

export function withPadding(input: string): string {
  if (input.length % 4 === 0) {
    return input
  }

  return input + '='.repeat(4 - (input.length % 4))
}

export function withoutPadding(input: string): string {
  return input.replace(/=+$/g, '')
}

export function validateBase64(input: string, stripWhitespace = true): ValidationResult {
  const raw = cleanInput(input, stripWhitespace)
  const errors: string[] = []
  const warnings: string[] = []

  if (!raw.length) {
    errors.push('EMPTY')
    return {
      isValid: false,
      format: 'standard',
      normalized: '',
      errors,
      warnings,
    }
  }

  const format = inferFormat(raw)

  if (format === 'mixed') {
    errors.push('MIXED_ALPHABET')
  }

  const alphabetRegex = format === 'url-safe' ? BASE64_URL_REGEX : BASE64_STD_REGEX
  if (!alphabetRegex.test(raw)) {
    errors.push('INVALID_CHARS')
  }

  const firstPaddingIndex = raw.indexOf('=')
  if (firstPaddingIndex !== -1 && /[^=]/.test(raw.slice(firstPaddingIndex))) {
    errors.push('PADDING_NOT_AT_END')
  }

  const paddingMatches = raw.match(/=+$/)
  const paddingLength = paddingMatches ? paddingMatches[0].length : 0
  if (paddingLength > 2) {
    errors.push('PADDING_TOO_LONG')
  }

  if (raw.length % 4 === 1) {
    errors.push('INVALID_LENGTH')
  }

  if (raw.length % 4 !== 0) {
    warnings.push('LENGTH_NOT_DIVISIBLE_BY_4')
  }

  if (stripWhitespace && /\s/.test(input)) {
    warnings.push('WHITESPACE_IGNORED')
  }

  const normalized = normalizeBase64Input(raw, {
    stripWhitespace: false,
    normalizeUrlSafe: true,
    addPadding: true,
  })

  return {
    isValid: errors.length === 0,
    format,
    normalized,
    errors,
    warnings,
  }
}
