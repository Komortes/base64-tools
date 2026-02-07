const BASE64_STD_REGEX = /^[A-Za-z0-9+/]*={0,2}$/
const BASE64_URL_REGEX = /^[A-Za-z0-9_-]*={0,2}$/

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

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i])
  }

  return btoa(binary)
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
    errors.push('Input is empty.')
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
    errors.push('Input mixes standard and URL-safe alphabets.')
  }

  const alphabetRegex = format === 'url-safe' ? BASE64_URL_REGEX : BASE64_STD_REGEX
  if (!alphabetRegex.test(raw)) {
    errors.push('Input contains non-Base64 characters.')
  }

  const firstPaddingIndex = raw.indexOf('=')
  if (firstPaddingIndex !== -1 && /[^=]/.test(raw.slice(firstPaddingIndex))) {
    errors.push('Padding must be only at the end.')
  }

  const paddingMatches = raw.match(/=+$/)
  const paddingLength = paddingMatches ? paddingMatches[0].length : 0
  if (paddingLength > 2) {
    errors.push('Padding cannot contain more than 2 "=" characters.')
  }

  if (raw.length % 4 === 1) {
    errors.push('Invalid length: Base64 length modulo 4 cannot be 1.')
  }

  if (raw.length % 4 !== 0) {
    warnings.push('Length is not divisible by 4. Decoder may require padding.')
  }

  if (stripWhitespace && /\s/.test(input)) {
    warnings.push('Whitespace was ignored during validation.')
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
