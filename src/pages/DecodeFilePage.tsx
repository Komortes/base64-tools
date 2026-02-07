import { useEffect, useState } from 'react'
import { DecodedPreview } from '../components/DecodedPreview'
import { bytesToSize, triggerDownload, tryTextPreview } from '../utils/blob'
import { decodeInputToBytes, type InputMode } from '../utils/decoder'
import { detectFileType, type PreviewKind } from '../utils/fileType'

interface FileResult {
  blob: Blob
  objectUrl: string
  filename: string
  mime: string
  size: number
  textPreview: string | null
  previewKind: PreviewKind
  source: string
  inputMode: InputMode
}

function inputModeLabel(mode: InputMode): string {
  if (mode === 'base64') return 'Plain Base64'
  if (mode === 'data-url-base64') return 'Data URL (base64)'
  return 'Data URL (plain payload)'
}

export function DecodeFilePage() {
  const [input, setInput] = useState('')
  const [mimeOverride, setMimeOverride] = useState('')
  const [result, setResult] = useState<FileResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (result?.objectUrl) {
        URL.revokeObjectURL(result.objectUrl)
      }
    }
  }, [result?.objectUrl])

  const handleDecode = async () => {
    if (result?.objectUrl) {
      URL.revokeObjectURL(result.objectUrl)
    }

    setError('')
    setResult(null)

    try {
      const decoded = decodeInputToBytes(input)
      const detected = detectFileType(decoded.bytes, decoded.hintedMime, mimeOverride)
      const blob = new Blob([new Uint8Array(decoded.bytes)], { type: detected.mime })
      const objectUrl = URL.createObjectURL(blob)
      const textPreview = detected.previewKind === 'text' ? await tryTextPreview(blob) : null

      setResult({
        blob,
        objectUrl,
        filename: `decoded-file.${detected.extension}`,
        mime: detected.mime,
        size: decoded.bytes.length,
        textPreview,
        previewKind: detected.previewKind,
        source: detected.source,
        inputMode: decoded.inputMode,
      })
    } catch {
      setError('Cannot decode file. Check Base64/data URL format and padding.')
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Decode Base64 → File</h2>
        <p>Smart type detection with preview for text, image, PDF, audio, and video.</p>
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={8}
        placeholder="Paste Base64 or Data URL"
      />

      <label className="field-label" htmlFor="mime-override">Optional MIME override</label>
      <input
        id="mime-override"
        type="text"
        value={mimeOverride}
        onChange={(event) => setMimeOverride(event.target.value)}
        placeholder="e.g. application/pdf"
      />

      <div className="button-row">
        <button onClick={handleDecode}>Decode File</button>
        {result && (
          <button className="button-ghost" onClick={() => triggerDownload(result.blob, result.filename)}>
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
            <p><strong>Filename:</strong> {result.filename}</p>
            <p><strong>Preview:</strong> {result.previewKind}</p>
            <p><strong>Input mode:</strong> {inputModeLabel(result.inputMode)}</p>
            <p><strong>Detection:</strong> {result.source}</p>
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
