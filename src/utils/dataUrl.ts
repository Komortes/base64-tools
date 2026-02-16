export interface DataUrlParameter {
  name: string
  value: string | null
  raw: string
}

export interface ParsedDataUrl {
  mime: string
  mediaType: string
  isBase64: boolean
  payload: string
  parameters: DataUrlParameter[]
}

export interface ExtractedPayload {
  payload: string
  mime?: string
  isBase64: boolean
  isDataUrl: boolean
}

const DEFAULT_MEDIA_TYPE = 'text/plain'
const DEFAULT_CHARSET_VALUE = 'US-ASCII'
const DEFAULT_DATA_URL_MIME = `${DEFAULT_MEDIA_TYPE};charset=${DEFAULT_CHARSET_VALUE}`

function splitMetadataTokens(metadata: string): string[] {
  const tokens: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < metadata.length; i += 1) {
    const char = metadata[i]

    if (char === '"') {
      inQuotes = !inQuotes
      current += char
      continue
    }

    if (char === ';' && !inQuotes) {
      tokens.push(current.trim())
      current = ''
      continue
    }

    current += char
  }

  tokens.push(current.trim())
  return tokens
}

function isBase64Token(token: string): boolean {
  return token.trim().toLowerCase() === 'base64'
}

function looksLikeMediaType(token: string): boolean {
  const normalized = token.trim()
  return normalized.includes('/') && !normalized.includes('=')
}

function unquoteParameterValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"')
  }

  return trimmed
}

function parseParameterToken(token: string): DataUrlParameter {
  const normalized = token.trim()
  const separatorIndex = normalized.indexOf('=')

  if (separatorIndex === -1) {
    const name = normalized.toLowerCase()
    return {
      name,
      value: null,
      raw: name,
    }
  }

  const name = normalized.slice(0, separatorIndex).trim().toLowerCase()
  const valueRaw = normalized.slice(separatorIndex + 1).trim()
  const value = unquoteParameterValue(valueRaw)

  return {
    name,
    value,
    raw: `${name}=${valueRaw}`,
  }
}

function hasCharsetParameter(parameters: DataUrlParameter[]): boolean {
  return parameters.some((parameter) => parameter.name === 'charset')
}

function buildMime(mediaType: string, parameters: DataUrlParameter[]): string {
  if (!parameters.length) {
    return mediaType
  }

  return `${mediaType};${parameters.map((parameter) => parameter.raw).join(';')}`
}

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
      mediaType: DEFAULT_MEDIA_TYPE,
      isBase64: false,
      payload,
      parameters: [],
    }
  }

  const tokens = splitMetadataTokens(metadata).filter(Boolean)
  const parameters: DataUrlParameter[] = []
  let isBase64 = false
  let mediaType = ''
  let hasExplicitMediaType = false

  for (const token of tokens) {
    if (!hasExplicitMediaType && looksLikeMediaType(token)) {
      mediaType = token.trim().toLowerCase()
      hasExplicitMediaType = true
      continue
    }

    if (isBase64Token(token)) {
      isBase64 = true
    } else {
      parameters.push(parseParameterToken(token))
    }
  }

  if (!hasExplicitMediaType) {
    mediaType = DEFAULT_MEDIA_TYPE
    if (!hasCharsetParameter(parameters)) {
      parameters.unshift({
        name: 'charset',
        value: DEFAULT_CHARSET_VALUE,
        raw: `charset=${DEFAULT_CHARSET_VALUE}`,
      })
    }
  }

  const mime = buildMime(mediaType, parameters)

  return {
    mime,
    mediaType,
    isBase64,
    payload,
    parameters,
  }
}

export function decodeDataUrlTextPayload(payload: string): string {
  const normalizedPayload = payload.replace(/%(?![0-9a-fA-F]{2})/g, '%25')

  try {
    return decodeURIComponent(normalizedPayload)
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
