import { useMemo, useState } from 'react'
import { DECODER_CONFIGS, type DecoderKind } from '../configs/decoders'
import { copyToClipboard } from '../utils/clipboard'
import { expectedPreviewForConfig, kindFromPreview } from '../utils/decoderMode'
import { decodeInputToBytes, type InputMode } from '../utils/decoder'
import { useObjectUrlLifecycle } from './useObjectUrlLifecycle'
import { detectFileType, type PreviewKind } from '../utils/fileType'
import { bytesToHex } from '../utils/hex'
import { buildBinaryPreview } from '../utils/decodedPreview'

const SAFE_URL_PROTOCOLS = new Set(['http:', 'https:'])

export interface DecodeResult {
  blob: Blob
  objectUrl?: string
  previewKind: PreviewKind
  mime: string
  extension: string
  sizeBytes: number
  filename: string
  textPreview: string | null
  inputMode: InputMode
  detection: string
}

export interface DecodeMismatchWarning {
  message: string
  suggestedKind: DecoderKind
  suggestedLabel: string
}

interface DecodersStateValues {
  kind: DecoderKind
  input: string
  mimeOverride: string
  isDecoding: boolean
  result: DecodeResult | null
  mismatchWarning: DecodeMismatchWarning | null
  parsedUrl: string | null
  error: string
}

interface DecodersStateActions {
  setInput: (value: string) => void
  setMimeOverride: (value: string) => void
  handleTypeChange: (nextType: DecoderKind) => void
  handleDecode: () => Promise<void>
  copyTextResult: () => Promise<boolean>
  clearAll: () => void
}

export interface UseDecodersStateResult extends DecodersStateValues, DecodersStateActions {}

function parseUrlValue(input: string): string | null {
  const candidate = input.trim()
  if (!candidate) {
    return null
  }

  try {
    const url = new URL(candidate)
    if (!SAFE_URL_PROTOCOLS.has(url.protocol)) {
      return null
    }
    return url.toString()
  } catch {
    return null
  }
}

export function useDecodersState(): UseDecodersStateResult {
  const [kind, setKind] = useState<DecoderKind>('auto')
  const [input, setInputValue] = useState('')
  const [mimeOverride, setMimeOverrideValue] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [mismatchWarning, setMismatchWarning] = useState<DecodeMismatchWarning | null>(null)
  const [error, setError] = useState('')

  const { revokeObjectUrl, setObjectUrl } = useObjectUrlLifecycle()
  const config = DECODER_CONFIGS.find((entry) => entry.kind === kind) ?? DECODER_CONFIGS[0]

  const parsedUrl = useMemo(
    () => (kind === 'url' && result?.textPreview ? parseUrlValue(result.textPreview) : null),
    [kind, result?.textPreview],
  )

  const resetMessages = () => {
    setError('')
  }

  const setInput = (value: string) => {
    setInputValue(value)
  }

  const setMimeOverride = (value: string) => {
    setMimeOverrideValue(value)
  }

  const handleTypeChange = (nextType: DecoderKind) => {
    revokeObjectUrl()

    setKind(nextType)
    setResult(null)
    setMismatchWarning(null)
    setMimeOverrideValue('')
    setError('')
  }

  const handleDecode = async () => {
    resetMessages()

    revokeObjectUrl()
    setResult(null)
    setMismatchWarning(null)
    setIsDecoding(true)

    try {
      const decoded = decodeInputToBytes(input)
      const detected = detectFileType(decoded.bytes, decoded.hintedMime, mimeOverride)

      let previewKind: PreviewKind = detected.previewKind
      let mime = detected.mime
      let extension = detected.extension
      let detection: string = detected.source
      let textPreview: string | null = null
      let blob: Blob
      let objectUrl: string | undefined

      if (config.mode === 'hex') {
        const hexText = bytesToHex(decoded.bytes)
        textPreview = hexText
        previewKind = 'text'
        mime = 'text/plain;charset=utf-8'
        extension = 'txt'
        detection = 'hex-render'
        blob = new Blob([hexText], { type: mime })
      } else if (config.mode === 'text') {
        const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(decoded.bytes)
        textPreview = decodedText
        previewKind = 'text'
        mime = mimeOverride.trim() || config.defaultMime
        extension = config.extension
        detection = 'text-render'
        blob = new Blob([decodedText], { type: mime })
      } else {
        const binaryPreview = await buildBinaryPreview(
          decoded.bytes,
          decoded.hintedMime,
          mimeOverride,
          detected,
        )

        if (config.mode === 'detected' || config.mode === 'auto') {
          previewKind = detected.previewKind
          mime = detected.mime
          extension = detected.extension
          detection = detected.source
        }

        blob = binaryPreview.blob
        textPreview = binaryPreview.textPreview
        objectUrl = URL.createObjectURL(blob)
        setObjectUrl(objectUrl)
      }

      const expectedPreview = expectedPreviewForConfig(config)
      if (expectedPreview && detected.previewKind !== expectedPreview) {
        const suggestedKind = kindFromPreview(detected.previewKind)
        if (suggestedKind !== kind) {
          const suggestedConfig = DECODER_CONFIGS.find((entry) => entry.kind === suggestedKind)
          setMismatchWarning({
            message: `Selected type does not match detected payload (${detected.mime}).`,
            suggestedKind,
            suggestedLabel: suggestedConfig?.label ?? suggestedKind,
          })
        }
      }

      setResult({
        blob,
        objectUrl,
        previewKind,
        mime,
        extension,
        sizeBytes: decoded.bytes.length,
        filename: `decoded-${kind}.${extension}`,
        textPreview,
        inputMode: decoded.inputMode,
        detection,
      })
    } catch (decodeError) {
      const message = decodeError instanceof Error ? decodeError.message : 'Decode failed.'
      setError(message)
    } finally {
      setIsDecoding(false)
    }
  }

  const copyTextResult = async () => {
    const text = result?.textPreview ?? ''
    return copyToClipboard(text)
  }

  const clearAll = () => {
    revokeObjectUrl()

    setInputValue('')
    setResult(null)
    setMismatchWarning(null)
    setError('')
  }

  return {
    kind,
    input,
    mimeOverride,
    isDecoding,
    result,
    mismatchWarning,
    parsedUrl,
    error,
    setInput,
    setMimeOverride,
    handleTypeChange,
    handleDecode,
    copyTextResult,
    clearAll,
  }
}
