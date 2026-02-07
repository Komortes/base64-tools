import { useEffect, useState } from 'react'
import { DecodedPreview } from '../components/DecodedPreview'
import { bytesToSize, triggerDownload, tryTextPreview } from '../utils/blob'
import { decodeInputToBytes, type InputMode } from '../utils/decoder'
import { detectFileType, type PreviewKind } from '../utils/fileType'

interface SmartDecodeResult {
  objectUrl: string
  blob: Blob
  mime: string
  extension: string
  previewKind: PreviewKind
  size: number
  source: string
  inputMode: InputMode
  textPreview: string | null
}

function sourceLabel(mode: InputMode): string {
  if (mode === 'base64') return 'Plain Base64'
  if (mode === 'data-url-base64') return 'Data URL (base64)'
  return 'Data URL (plain text payload)'
}

export function SmartDecodePage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<SmartDecodeResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (result?.objectUrl) {
        URL.revokeObjectURL(result.objectUrl)
      }
    }
  }, [result?.objectUrl])

  const handleSmartDecode = async () => {
    if (result?.objectUrl) {
      URL.revokeObjectURL(result.objectUrl)
    }

    setError('')
    setResult(null)

    try {
      const decoded = decodeInputToBytes(input)
      const detected = detectFileType(decoded.bytes, decoded.hintedMime)
      const blob = new Blob([new Uint8Array(decoded.bytes)], { type: detected.mime })
      const objectUrl = URL.createObjectURL(blob)
      const textPreview = detected.previewKind === 'text' ? await tryTextPreview(blob) : null

      setResult({
        objectUrl,
        blob,
        mime: detected.mime,
        extension: detected.extension,
        previewKind: detected.previewKind,
        size: decoded.bytes.length,
        source: detected.source,
        inputMode: decoded.inputMode,
        textPreview,
      })
    } catch {
      setError('Unable to decode payload. Check Base64/data URL format and retry.')
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Smart Decode (Any Type)</h2>
        <p>Auto-detects payload type and shows the best preview for it.</p>
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={10}
        placeholder="Paste Base64 or Data URL"
      />

      <div className="button-row">
        <button onClick={handleSmartDecode}>Smart Decode</button>
        {result && (
          <button
            className="button-ghost"
            onClick={() => triggerDownload(result.blob, `decoded.${result.extension}`)}
          >
            Download
          </button>
        )}
      </div>

      {error && <p className="message error">{error}</p>}

      {result && (
        <div className="preview-card">
          <div className="meta-grid">
            <p><strong>MIME:</strong> {result.mime}</p>
            <p><strong>Size:</strong> {bytesToSize(result.size)}</p>
            <p><strong>Preview:</strong> {result.previewKind}</p>
            <p><strong>Input:</strong> {sourceLabel(result.inputMode)}</p>
            <p><strong>Detection:</strong> {result.source}</p>
            <p><strong>Suggested ext:</strong> .{result.extension}</p>
          </div>

          <DecodedPreview
            previewKind={result.previewKind}
            objectUrl={result.objectUrl}
            textPreview={result.textPreview}
          />
        </div>
      )}
    </section>
  )
}
