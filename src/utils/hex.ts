export function hexToBytes(input: string): Uint8Array {
  const normalized = input
    .trim()
    .replace(/0x/gi, '')
    .replace(/\s+/g, '')

  if (!normalized.length) {
    throw new Error('HEX_EMPTY')
  }

  if (/[^a-fA-F0-9]/.test(normalized)) {
    throw new Error('HEX_INVALID')
  }

  if (normalized.length % 2 !== 0) {
    throw new Error('HEX_ODD_LENGTH')
  }

  const bytes = new Uint8Array(normalized.length / 2)

  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = Number.parseInt(normalized.slice(i, i + 2), 16)
  }

  return bytes
}

export function bytesToHex(bytes: Uint8Array, withSpaces = true): string {
  const pairs: string[] = []

  for (let i = 0; i < bytes.length; i += 1) {
    pairs.push(bytes[i].toString(16).padStart(2, '0'))
  }

  return withSpaces ? pairs.join(' ') : pairs.join('')
}
