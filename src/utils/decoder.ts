import { base64ToBytes } from './base64'
import { decodeDataUrlTextPayload, extractPayload } from './dataUrl'

export type InputMode = 'base64' | 'data-url-base64' | 'data-url-text'

export interface DecodedInput {
  bytes: Uint8Array
  hintedMime?: string
  inputMode: InputMode
}

export function decodeInputToBytes(input: string): DecodedInput {
  const extracted = extractPayload(input)

  if (extracted.isDataUrl && !extracted.isBase64) {
    const text = decodeDataUrlTextPayload(extracted.payload)
    return {
      bytes: new TextEncoder().encode(text),
      hintedMime: extracted.mime,
      inputMode: 'data-url-text',
    }
  }

  const bytes = base64ToBytes(extracted.payload, {
    stripWhitespace: true,
    normalizeUrlSafe: true,
    addPadding: true,
  })

  return {
    bytes,
    hintedMime: extracted.mime,
    inputMode: extracted.isDataUrl ? 'data-url-base64' : 'base64',
  }
}
