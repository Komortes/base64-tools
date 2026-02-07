import { useEffect, useMemo, useRef, useState } from 'react'
import { DecodedPreview } from '../components/DecodedPreview'
import { base64ToBytes } from '../utils/base64'
import { bytesToSize, triggerDownload, tryTextPreview } from '../utils/blob'
import { copyToClipboard } from '../utils/clipboard'
import { decodeDataUrlTextPayload, parseDataUrl } from '../utils/dataUrl'
import { detectFileType, extensionFromMime, type PreviewKind } from '../utils/fileType'

interface DataUrlPreviewState {
  blob?: Blob
  objectUrl?: string
  previewKind: PreviewKind
  mime: string
  extension: string
  sizeBytes?: number
  textPreview: string | null
}

export function DataUrlToolsPage() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [previewState, setPreviewState] = useState<DataUrlPreviewState | null>(null)
  const activeObjectUrlRef = useRef<string | null>(null)

  const parsed = useMemo(() => parseDataUrl(input), [input])

  useEffect(() => {
    return () => {
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current)
        activeObjectUrlRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const buildPreview = async () => {
      if (activeObjectUrlRef.current) {
        URL.revokeObjectURL(activeObjectUrlRef.current)
        activeObjectUrlRef.current = null
      }

      if (!parsed) {
        setPreviewState(null)
        return
      }

      if (!parsed.isBase64) {
        const decodedText = decodeDataUrlTextPayload(parsed.payload)
        if (cancelled) {
          return
        }

        setPreviewState({
          previewKind: 'text',
          mime: parsed.mime || 'text/plain;charset=utf-8',
          extension: extensionFromMime(parsed.mime || 'text/plain;charset=utf-8'),
          sizeBytes: decodedText.length,
          textPreview: decodedText,
        })
        return
      }

      try {
        const bytes = base64ToBytes(parsed.payload, {
          stripWhitespace: true,
          normalizeUrlSafe: true,
          addPadding: true,
        })

        const detected = detectFileType(bytes, parsed.mime)
        const blob = new Blob([new Uint8Array(bytes)], { type: detected.mime })
        const objectUrl = URL.createObjectURL(blob)
        const textPreview =
          detected.previewKind === 'text' ? await tryTextPreview(blob) : null

        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        activeObjectUrlRef.current = objectUrl
        setPreviewState({
          blob,
          objectUrl,
          previewKind: detected.previewKind,
          mime: detected.mime,
          extension: detected.extension,
          sizeBytes: bytes.length,
          textPreview,
        })
      } catch {
        if (!cancelled) {
          setPreviewState(null)
        }
      }
    }

    buildPreview()

    return () => {
      cancelled = true
    }
  }, [parsed])

  const handleCopyPayload = async () => {
    setError('')
    if (!parsed) {
      setError('Input is not a valid data URL.')
      return
    }

    const ok = await copyToClipboard(parsed.payload)
    setStatus(ok ? 'Payload copied.' : 'Copy failed.')
  }

  const handleDownload = () => {
    setError('')

    if (!parsed || !previewState) {
      setError('Cannot download. Parse a valid data URL first.')
      return
    }

    if (parsed.isBase64 && previewState.blob) {
      triggerDownload(previewState.blob, `data-url-payload.${previewState.extension}`)
      setStatus('Payload downloaded.')
      return
    }

    const text = decodeDataUrlTextPayload(parsed.payload)
    const blob = new Blob([text], { type: previewState.mime || 'text/plain;charset=utf-8' })
    triggerDownload(blob, `data-url-text.${previewState.extension}`)
    setStatus('Text payload downloaded.')
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Data URL Tools</h2>
        <p>Supports data URLs with parameters and previews image/PDF/media/text payloads.</p>
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={8}
        placeholder="Paste data URL"
      />

      {!parsed && input.trim() && <p className="message error">Input does not match data URL format.</p>}

      {parsed && (
        <div className="preview-card">
          <div className="meta-grid">
            <p><strong>MIME:</strong> {previewState?.mime ?? parsed.mime}</p>
            <p><strong>Encoding:</strong> {parsed.isBase64 ? 'base64' : 'plain/URL-encoded'}</p>
            <p><strong>Payload length:</strong> {parsed.payload.length}</p>
            <p><strong>Parameters:</strong> {parsed.parameters.length ? parsed.parameters.join('; ') : 'none'}</p>
            <p><strong>Preview:</strong> {previewState?.previewKind ?? 'n/a'}</p>
            <p><strong>Size:</strong> {previewState?.sizeBytes ? bytesToSize(previewState.sizeBytes) : 'n/a'}</p>
          </div>

          <div className="button-row">
            <button onClick={handleCopyPayload}>Copy payload</button>
            <button className="button-ghost" onClick={handleDownload}>Download payload</button>
          </div>

          {previewState && (
            <DecodedPreview
              previewKind={previewState.previewKind}
              objectUrl={previewState.objectUrl}
              textPreview={previewState.textPreview}
            />
          )}
        </div>
      )}

      {error && <p className="message error">{error}</p>}
      {!error && status && <p className="message success">{status}</p>}
    </section>
  )
}
