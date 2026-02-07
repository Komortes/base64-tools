function normalizeHexInput(input: string): string {
  return input
    .trim()
    .replace(/0x/gi, '')
    .replace(/[^a-fA-F0-9]/g, '')
}

export function hexToBytes(input: string): Uint8Array {
  const normalized = normalizeHexInput(input)

  if (!normalized.length) {
    throw new Error('Hex input is empty.')
  }

  if (!/^[a-fA-F0-9]+$/.test(normalized)) {
    throw new Error('Hex contains invalid characters.')
  }

  if (normalized.length % 2 !== 0) {
    throw new Error('Hex length must be even.')
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
