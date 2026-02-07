export interface ParsedDataUrl {
  mime: string
  isBase64: boolean
  payload: string
  parameters: string[]
}

export interface ExtractedPayload {
  payload: string
  mime?: string
  isBase64: boolean
  isDataUrl: boolean
}

const DEFAULT_DATA_URL_MIME = 'text/plain;charset=US-ASCII'

export function parseDataUrl(value: string): ParsedDataUrl | null {
  const trimmed = value.trim()
  if (!trimmed.toLowerCase().startsWith('data:')) {
    return null
  }

  const commaIndex = trimmed.indexOf(',')
  if (commaIndex === -1) {
    return null
  }

  const metadata = trimmed.slice(5, commaIndex)
  const payload = trimmed.slice(commaIndex + 1)

  if (!metadata) {
    return {
      mime: DEFAULT_DATA_URL_MIME,
      isBase64: false,
      payload,
      parameters: [],
    }
  }

  const parts = metadata.split(';').filter(Boolean)
  const parameters: string[] = []
  let isBase64 = false

  for (const part of parts) {
    if (part.toLowerCase() === 'base64') {
      isBase64 = true
    } else {
      parameters.push(part)
    }
  }

  const mime = parameters.length > 0 ? parameters.join(';') : DEFAULT_DATA_URL_MIME

  return {
    mime,
    isBase64,
    payload,
    parameters,
  }
}

export function decodeDataUrlTextPayload(payload: string): string {
  try {
    return decodeURIComponent(payload)
  } catch {
    return payload
  }
}

export function extractPayload(input: string): ExtractedPayload {
  const parsed = parseDataUrl(input)

  if (!parsed) {
    return {
      payload: input,
      isBase64: true,
      isDataUrl: false,
    }
  }

  return {
    payload: parsed.payload,
    mime: parsed.mime,
    isBase64: parsed.isBase64,
    isDataUrl: true,
  }
}
