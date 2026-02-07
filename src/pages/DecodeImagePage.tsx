import { useEffect, useState } from 'react'
import { bytesToSize, triggerDownload } from '../utils/blob'
import { decodeInputToBytes } from '../utils/decoder'
import { detectFileType } from '../utils/fileType'

interface DecodedImageResult {
  blob: Blob
  url: string
  mime: string
  size: number
  resolution?: string
  filename: string
}

function getImageResolution(url: string): Promise<string | undefined> {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(`${image.naturalWidth}×${image.naturalHeight}`)
    image.onerror = () => resolve(undefined)
    image.src = url
  })
}

export function DecodeImagePage() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState<DecodedImageResult | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url)
      }
    }
  }, [result?.url])

  const handleDecode = async () => {
    if (result?.url) {
      URL.revokeObjectURL(result.url)
    }

    setError('')
    setResult(null)

    try {
      const decoded = decodeInputToBytes(input)
      const detected = detectFileType(decoded.bytes, decoded.hintedMime)

      if (detected.previewKind !== 'image') {
        setError(`Decoded content is ${detected.mime}, not an image. Use Smart Decode or Decode File.`)
        return
      }

      const blob = new Blob([new Uint8Array(decoded.bytes)], { type: detected.mime })
      const url = URL.createObjectURL(blob)
      const resolution = await getImageResolution(url)

      setResult({
        blob,
        url,
        mime: detected.mime,
        size: decoded.bytes.length,
        resolution,
        filename: `decoded-image.${detected.extension}`,
      })
    } catch {
      setError('Cannot decode image. Use valid Base64 or Data URL input.')
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Decode Base64 → Image</h2>
        <p>Auto-detects image formats from both Base64 and Data URL.</p>
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={8}
        placeholder="Paste Base64 or data:image/..."
      />

      <div className="button-row">
        <button onClick={handleDecode}>Decode Image</button>
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
            <p><strong>Resolution:</strong> {result.resolution ?? 'Unknown'}</p>
          </div>
          <img src={result.url} alt="Decoded preview" className="image-preview" />
        </div>
      )}
    </section>
  )
}
