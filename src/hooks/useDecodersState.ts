import { useCallback, useMemo, useRef, useState, useEffect } from 'react'
import { DECODER_CONFIGS, type DecoderKind } from '../configs/decoders'
import { copyToClipboard } from '../utils/clipboard'
import { expectedPreviewForConfig, kindFromPreview } from '../utils/decoderMode'
import { decodeInputToBytes, type InputMode } from '../utils/decoder'
import { useObjectUrlLifecycle } from './useObjectUrlLifecycle'
import { detectFileType, type PreviewKind } from '../utils/fileType'
import { bytesToHex } from '../utils/hex'
import { buildBinaryPreview } from '../utils/decodedPreview'
import { useI18n } from '../i18n/useI18n'
import { decoderLabel } from '../i18n/toolStrings'
import { useDebouncedValue } from './useDebouncedValue'

const LIVE_RECOMPUTE_DELAY_MS = 160
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
  isOutputProcessing: boolean
  result: DecodeResult | null
  mismatchWarning: DecodeMismatchWarning | null
  parsedUrl: string | null
  error: string
  outputRevision: number
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

function translateDecodeError(message: string, t: (key: string) => string): string {
  if (message === 'INVALID_BASE64') {
    return t('decoders.error.invalidInput')
  }

  return message
}

export function useDecodersState(): UseDecodersStateResult {
  const { t } = useI18n()
  const [kind, setKind] = useState<DecoderKind>('auto')
  const [input, setInputValue] = useState('')
  const [mimeOverride, setMimeOverrideValue] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [mismatchWarning, setMismatchWarning] = useState<DecodeMismatchWarning | null>(null)
  const [error, setError] = useState('')
  const [outputRevision, setOutputRevision] = useState(0)

  const { revokeObjectUrl, setObjectUrl } = useObjectUrlLifecycle()
  const config = DECODER_CONFIGS.find((entry) => entry.kind === kind) ?? DECODER_CONFIGS[0]
  const debouncedPayload = useDebouncedValue({ input, mimeOverride }, LIVE_RECOMPUTE_DELAY_MS)
  const isOutputProcessing =
    isDecoding ||
    input !== debouncedPayload.input ||
    mimeOverride !== debouncedPayload.mimeOverride
  const activeRunIdRef = useRef(0)

  const parsedUrl = useMemo(
    () => (kind === 'url' && result?.textPreview ? parseUrlValue(result.textPreview) : null),
    [kind, result?.textPreview],
  )

  const clearOutputState = useCallback(() => {
    revokeObjectUrl()
    setResult(null)
    setMismatchWarning(null)
    setError('')
    setOutputRevision((prev) => prev + 1)
  }, [revokeObjectUrl])

  const runDecode = useCallback(
    async (
      nextInput: string,
      nextMimeOverride: string,
    ) => {
      const runId = activeRunIdRef.current + 1
      activeRunIdRef.current = runId

      if (!nextInput.trim()) {
        if (activeRunIdRef.current === runId) {
          clearOutputState()
          setIsDecoding(false)
        }
        return
      }

      setIsDecoding(true)

      try {
        const decoded = decodeInputToBytes(nextInput)
        const detected = detectFileType(decoded.bytes, decoded.hintedMime, nextMimeOverride)

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
          mime = nextMimeOverride.trim() || config.defaultMime
          extension = config.extension
          detection = 'text-render'
          blob = new Blob([decodedText], { type: mime })
        } else {
          const binaryPreview = await buildBinaryPreview(
            decoded.bytes,
            decoded.hintedMime,
            nextMimeOverride,
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
        }

        const expectedPreview = expectedPreviewForConfig(config)
        let nextMismatchWarning: DecodeMismatchWarning | null = null
        if (expectedPreview && detected.previewKind !== expectedPreview) {
          const suggestedKind = kindFromPreview(detected.previewKind)
          if (suggestedKind !== kind) {
            nextMismatchWarning = {
              message: t('decoders.warning.typeMismatch', { mime: detected.mime }),
              suggestedKind,
              suggestedLabel: decoderLabel(suggestedKind, t),
            }
          }
        }

        if (activeRunIdRef.current !== runId) {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl)
          }
          return
        }

        setObjectUrl(objectUrl ?? null)
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
        setMismatchWarning(nextMismatchWarning)
        setError('')
        setOutputRevision((prev) => prev + 1)
      } catch (decodeError) {
        if (activeRunIdRef.current !== runId) {
          return
        }

        const message =
          decodeError instanceof Error
            ? translateDecodeError(decodeError.message, t)
            : t('decoders.error.decodeFailed')

        revokeObjectUrl()
        setResult(null)
        setMismatchWarning(null)
        setError(message)
        setOutputRevision((prev) => prev + 1)
      } finally {
        if (activeRunIdRef.current === runId) {
          setIsDecoding(false)
        }
      }
    },
    [clearOutputState, config, kind, revokeObjectUrl, setObjectUrl, t],
  )

  useEffect(() => {
    void runDecode(debouncedPayload.input, debouncedPayload.mimeOverride)
  }, [debouncedPayload, kind, runDecode])

  const setInput = (value: string) => {
    setInputValue(value)
  }

  const setMimeOverride = (value: string) => {
    setMimeOverrideValue(value)
  }

  const handleTypeChange = (nextType: DecoderKind) => {
    activeRunIdRef.current += 1
    setIsDecoding(false)
    setKind(nextType)
    setResult(null)
    setMismatchWarning(null)
    setMimeOverrideValue('')
    setError('')
    setOutputRevision((prev) => prev + 1)
    revokeObjectUrl()
  }

  const handleDecode = async () => {
    await runDecode(input, mimeOverride)
  }

  const copyTextResult = async () => {
    const text = result?.textPreview ?? ''
    return copyToClipboard(text)
  }

  const clearAll = () => {
    activeRunIdRef.current += 1
    setIsDecoding(false)
    setInputValue('')
    setMimeOverrideValue('')
    clearOutputState()
  }

  return {
    kind,
    input,
    mimeOverride,
    isDecoding,
    isOutputProcessing,
    result,
    mismatchWarning,
    parsedUrl,
    error,
    outputRevision,
    setInput,
    setMimeOverride,
    handleTypeChange,
    handleDecode,
    copyTextResult,
    clearAll,
  }
}
