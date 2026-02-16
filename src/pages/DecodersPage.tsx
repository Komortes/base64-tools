import { useState } from 'react'
import { ModeSelector } from '../components/codec/ModeSelector'
import { DecodedPreview } from '../components/DecodedPreview'
import { DECODER_CONFIGS, type DecoderKind } from '../configs/decoders'
import { bytesToSize, triggerDownload } from '../utils/blob'
import { copyToClipboard } from '../utils/clipboard'
import { expectedPreviewForConfig, kindFromPreview } from '../utils/decoderMode'
import { decodeInputToBytes, type InputMode } from '../utils/decoder'
import { useObjectUrlLifecycle } from '../hooks/useObjectUrlLifecycle'
import { detectFileType, type PreviewKind } from '../utils/fileType'
import { bytesToHex } from '../utils/hex'
import { buildBinaryPreview } from '../utils/decodedPreview'

interface DecodeResult {
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

interface DecodeMismatchWarning {
  message: string
  suggestedKind: DecoderKind
  suggestedLabel: string
}

function inputModeLabel(mode: InputMode): string {
  if (mode === 'base64') return 'Plain Base64'
  if (mode === 'data-url-base64') return 'Data URL (base64)'
  return 'Data URL (plain payload)'
}

function parseUrlValue(input: string): string | null {
  const candidate = input.trim()
  if (!candidate) {
    return null
  }

  try {
    const url = new URL(candidate)
    return url.toString()
  } catch {
    return null
  }
}

export function DecodersPage() {
  const [kind, setKind] = useState<DecoderKind>('auto')
  const [input, setInput] = useState('')
  const [mimeOverride, setMimeOverride] = useState('')
  const [isDecoding, setIsDecoding] = useState(false)
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [mismatchWarning, setMismatchWarning] = useState<DecodeMismatchWarning | null>(null)
  const [error, setError] = useState('')

  const { revokeObjectUrl, setObjectUrl } = useObjectUrlLifecycle()

  const config = DECODER_CONFIGS.find((entry) => entry.kind === kind) ?? DECODER_CONFIGS[0]

  const resetMessages = () => {
    setError('')
  }

  const handleTypeChange = (nextType: DecoderKind) => {
    revokeObjectUrl()

    setKind(nextType)
    setResult(null)
    setMismatchWarning(null)
    setMimeOverride('')
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
      if (
        expectedPreview &&
        detected.previewKind !== expectedPreview
      ) {
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
    await copyToClipboard(text)
  }

  const clearAll = () => {
    revokeObjectUrl()

    setInput('')
    setResult(null)
    setMismatchWarning(null)
    setError('')
  }

  const parsedUrl = kind === 'url' && result?.textPreview ? parseUrlValue(result.textPreview) : null

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Decoders</h2>
        <p>Decode Base64 or Data URL into files, text, media, or auto-detected payloads.</p>
      </div>

      <ModeSelector
        activeKind={kind}
        items={DECODER_CONFIGS.map(({ kind: modeKind, label }) => ({ kind: modeKind, label }))}
        onSelect={handleTypeChange}
      />

      <article className="preview-card source-card">
        <h3>Input</h3>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={14}
          placeholder="Paste Base64 or Data URL"
        />

        <input
          id="decode-mime-override"
          type="text"
          value={mimeOverride}
          onChange={(event) => setMimeOverride(event.target.value)}
          placeholder="Optional MIME override (e.g. application/pdf)"
        />

        <div className="button-row">
          <button onClick={handleDecode} disabled={isDecoding}>Decode</button>
          <button type="button" className="button-ghost" onClick={clearAll} disabled={isDecoding}>
            Clear
          </button>
        </div>

        {isDecoding && (
          <div className="inline-loader" role="status" aria-live="polite">
            <span className="spinner" />
            <span>Decoding...</span>
          </div>
        )}
      </article>

      <article className="output-block output-card">
        <h3 className="output-title">
          <span>Decoded Output</span>
          {mismatchWarning && (
            <button
              type="button"
              className="warning-tag"
              onClick={() => handleTypeChange(mismatchWarning.suggestedKind)}
            >
              <span>{mismatchWarning.message}</span>
              <span>Switch to {mismatchWarning.suggestedLabel}</span>
            </button>
          )}
        </h3>

        {!result && <p className="hint-text">Decode payload to see preview and download options.</p>}

        {result && (
          <>
            <div className="meta-grid">
              <p><strong>MIME:</strong> {result.mime}</p>
              <p><strong>Size:</strong> {bytesToSize(result.sizeBytes)}</p>
              <p><strong>Preview:</strong> {result.previewKind}</p>
              <p><strong>Input mode:</strong> {inputModeLabel(result.inputMode)}</p>
              <p><strong>Detection:</strong> {result.detection}</p>
              <p><strong>Filename:</strong> {result.filename}</p>
            </div>

            {parsedUrl && (
              <p className="link-preview">
                Parsed URL: <a href={parsedUrl} target="_blank" rel="noreferrer">{parsedUrl}</a>
              </p>
            )}

            <DecodedPreview
              previewKind={result.previewKind}
              objectUrl={result.objectUrl}
              textPreview={result.textPreview}
            />

            <div className="button-row">
              <button onClick={() => triggerDownload(result.blob, result.filename)}>Download</button>
              {result.previewKind === 'text' && (
                <button type="button" className="button-ghost" onClick={copyTextResult}>
                  Copy text
                </button>
              )}
            </div>
          </>
        )}
      </article>

      {error && <p className="message error">{error}</p>}
    </section>
  )
}
