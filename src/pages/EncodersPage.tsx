import { useEffect, useMemo, useState } from 'react'
import { DecodedPreview } from '../components/DecodedPreview'
import { bytesToBase64 } from '../utils/base64'
import { bytesToSize, triggerDownload, tryTextPreview } from '../utils/blob'
import { copyToClipboard } from '../utils/clipboard'
import { decodeInputToBytes } from '../utils/decoder'
import {
  detectFileType,
  type FileTypeResult,
  type PreviewKind,
} from '../utils/fileType'
import { bytesToHex, hexToBytes } from '../utils/hex'

type EncoderKind =
  | 'audio'
  | 'css'
  | 'file'
  | 'hex'
  | 'html'
  | 'image'
  | 'pdf'
  | 'text'
  | 'url'
  | 'video'

interface EncoderConfig {
  kind: EncoderKind
  label: string
  mode: 'file' | 'text' | 'hex'
  accept?: string
  defaultMime: string
  previewKind: PreviewKind
  placeholder: string
  extension: string
}

interface DecodeResult {
  blob: Blob
  objectUrl?: string
  previewKind: PreviewKind
  mime: string
  sizeBytes: number
  filename: string
  textPreview: string | null
}

const ENCODER_CONFIGS: EncoderConfig[] = [
  {
    kind: 'audio',
    label: 'Audio to Base64',
    mode: 'file',
    accept: 'audio/*,.mp3,.wav,.ogg,.m4a,.flac',
    defaultMime: 'audio/mpeg',
    previewKind: 'audio',
    placeholder: 'Upload audio file to encode.',
    extension: 'mp3',
  },
  {
    kind: 'css',
    label: 'CSS to Base64',
    mode: 'text',
    defaultMime: 'text/css;charset=utf-8',
    previewKind: 'text',
    placeholder: 'Paste CSS code here.',
    extension: 'css',
  },
  {
    kind: 'file',
    label: 'File to Base64',
    mode: 'file',
    accept: '*/*',
    defaultMime: 'application/octet-stream',
    previewKind: 'none',
    placeholder: 'Upload any file to encode.',
    extension: 'bin',
  },
  {
    kind: 'hex',
    label: 'Hex to Base64',
    mode: 'hex',
    defaultMime: 'application/octet-stream',
    previewKind: 'text',
    placeholder: 'Paste hex string. Example: 48656c6c6f or 48 65 6c 6c 6f',
    extension: 'hex',
  },
  {
    kind: 'html',
    label: 'HTML to Base64',
    mode: 'text',
    defaultMime: 'text/html;charset=utf-8',
    previewKind: 'text',
    placeholder: 'Paste HTML markup.',
    extension: 'html',
  },
  {
    kind: 'image',
    label: 'Image to Base64',
    mode: 'file',
    accept: 'image/*,.png,.jpg,.jpeg,.gif,.webp,.svg',
    defaultMime: 'image/png',
    previewKind: 'image',
    placeholder: 'Upload image file.',
    extension: 'png',
  },
  {
    kind: 'pdf',
    label: 'PDF to Base64',
    mode: 'file',
    accept: '.pdf,application/pdf',
    defaultMime: 'application/pdf',
    previewKind: 'pdf',
    placeholder: 'Upload PDF file.',
    extension: 'pdf',
  },
  {
    kind: 'text',
    label: 'Text to Base64',
    mode: 'text',
    defaultMime: 'text/plain;charset=utf-8',
    previewKind: 'text',
    placeholder: 'Paste plain text.',
    extension: 'txt',
  },
  {
    kind: 'url',
    label: 'URL to Base64',
    mode: 'text',
    defaultMime: 'text/plain;charset=utf-8',
    previewKind: 'text',
    placeholder: 'Paste URL, e.g. https://example.com/path?q=1',
    extension: 'txt',
  },
  {
    kind: 'video',
    label: 'Video to Base64',
    mode: 'file',
    accept: 'video/*,.mp4,.webm,.mov,.mkv',
    defaultMime: 'video/mp4',
    previewKind: 'video',
    placeholder: 'Upload video file.',
    extension: 'mp4',
  },
]

function expectedKindMatches(config: EncoderConfig, detected: FileTypeResult): boolean {
  if (config.kind === 'file') {
    return true
  }

  if (config.previewKind === 'none') {
    return true
  }

  return detected.previewKind === config.previewKind
}

function modeHelpText(config: EncoderConfig): string {
  if (config.mode === 'file') {
    return 'Input mode: upload file'
  }

  if (config.mode === 'hex') {
    return 'Input mode: hex string'
  }

  return 'Input mode: text'
}

export function EncodersPage() {
  const [kind, setKind] = useState<EncoderKind>('text')
  const [textInput, setTextInput] = useState('')
  const [hexInput, setHexInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [base64Input, setBase64Input] = useState('')
  const [result, setResult] = useState<DecodeResult | null>(null)
  const [withDataUrlPrefix, setWithDataUrlPrefix] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const config = useMemo(
    () => ENCODER_CONFIGS.find((entry) => entry.kind === kind) ?? ENCODER_CONFIGS[0],
    [kind],
  )

  useEffect(() => {
    return () => {
      if (result?.objectUrl) {
        URL.revokeObjectURL(result.objectUrl)
      }
    }
  }, [result?.objectUrl])

  const resetMessages = () => {
    setStatus('')
    setError('')
  }

  const handleTypeChange = (nextType: EncoderKind) => {
    if (result?.objectUrl) {
      URL.revokeObjectURL(result.objectUrl)
    }

    setKind(nextType)
    setTextInput('')
    setHexInput('')
    setSelectedFile(null)
    setBase64Input('')
    setResult(null)
    resetMessages()
  }

  const handleEncode = async () => {
    resetMessages()

    try {
      let bytes: Uint8Array
      let mime = config.defaultMime

      if (config.mode === 'file') {
        if (!selectedFile) {
          setError('Choose a file before encoding.')
          return
        }

        bytes = new Uint8Array(await selectedFile.arrayBuffer())
        if (selectedFile.type) {
          mime = selectedFile.type
        }
      } else if (config.mode === 'hex') {
        bytes = hexToBytes(hexInput)
      } else {
        bytes = new TextEncoder().encode(textInput)
      }

      const encoded = bytesToBase64(bytes)
      const output = withDataUrlPrefix ? `data:${mime};base64,${encoded}` : encoded
      setBase64Input(output)
      setStatus('Encoded to Base64.')
    } catch (encodeError) {
      const message = encodeError instanceof Error ? encodeError.message : 'Encode failed.'
      setError(message)
    }
  }

  const handleDecode = async () => {
    resetMessages()

    if (result?.objectUrl) {
      URL.revokeObjectURL(result.objectUrl)
    }

    setResult(null)

    try {
      const decoded = decodeInputToBytes(base64Input)
      const detected = detectFileType(decoded.bytes, decoded.hintedMime)
      let mime = config.defaultMime
      let previewKind: PreviewKind = config.previewKind
      let extension = config.extension

      if (kind === 'file') {
        mime = detected.mime
        previewKind = detected.previewKind
        extension = detected.extension
      } else if (config.mode === 'file') {
        if (expectedKindMatches(config, detected)) {
          mime = detected.mime
          extension = detected.extension
          previewKind = detected.previewKind
        }
      } else if (kind === 'hex') {
        previewKind = 'text'
      }

      let textPreview: string | null = null
      let blob: Blob
      let objectUrl: string | undefined

      if (kind === 'hex') {
        const hexText = bytesToHex(decoded.bytes)
        textPreview = hexText
        blob = new Blob([hexText], { type: 'text/plain;charset=utf-8' })
      } else if (config.mode === 'text') {
        const decodedText = new TextDecoder('utf-8', { fatal: false }).decode(decoded.bytes)
        textPreview = decodedText
        blob = new Blob([decodedText], { type: mime })
      } else {
        blob = new Blob([new Uint8Array(decoded.bytes)], { type: mime })
        objectUrl = URL.createObjectURL(blob)
        if (previewKind === 'text') {
          textPreview = await tryTextPreview(blob)
        }
      }

      setResult({
        blob,
        objectUrl,
        previewKind,
        mime,
        sizeBytes: decoded.bytes.length,
        filename: `decoded-${kind}.${extension}`,
        textPreview,
      })
      setStatus('Decoded from Base64.')
    } catch (decodeError) {
      const message = decodeError instanceof Error ? decodeError.message : 'Decode failed.'
      setError(message)
    }
  }

  const copyBase64 = async () => {
    const ok = await copyToClipboard(base64Input)
    setStatus(ok ? 'Base64 copied.' : 'Copy failed.')
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Encoders</h2>
        <p>
          Two-way conversion for Audio, CSS, File, Hex, HTML, Image, PDF, Text, URL and Video.
        </p>
      </div>

      <div className="encoder-type-grid">
        {ENCODER_CONFIGS.map((entry) => (
          <button
            key={entry.kind}
            type="button"
            onClick={() => handleTypeChange(entry.kind)}
            className={`mode-pill${kind === entry.kind ? ' is-active' : ''}`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <p className="field-label">{modeHelpText(config)}</p>

      {config.mode === 'file' && (
        <div className="preview-card">
          <p>{config.placeholder}</p>
          <input
            type="file"
            accept={config.accept}
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
          />
          <p className="field-label">
            {selectedFile
              ? `Selected: ${selectedFile.name} (${bytesToSize(selectedFile.size)})`
              : 'No file selected'}
          </p>
        </div>
      )}

      {config.mode === 'text' && (
        <textarea
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          rows={7}
          placeholder={config.placeholder}
        />
      )}

      {config.mode === 'hex' && (
        <textarea
          value={hexInput}
          onChange={(event) => setHexInput(event.target.value)}
          rows={7}
          placeholder={config.placeholder}
        />
      )}

      <label>
        <input
          type="checkbox"
          checked={withDataUrlPrefix}
          onChange={(event) => setWithDataUrlPrefix(event.target.checked)}
        />
        Include data URL prefix when encoding
      </label>

      <div className="button-row">
        <button onClick={handleEncode}>Encode → Base64</button>
      </div>

      <div className="output-block">
        <label className="field-label" htmlFor="encoders-base64">Base64 (or Data URL)</label>
        <textarea
          id="encoders-base64"
          value={base64Input}
          onChange={(event) => setBase64Input(event.target.value)}
          rows={8}
          placeholder="Base64 output/input"
        />
        <div className="button-row">
          <button onClick={handleDecode}>Decode ← Base64</button>
          <button className="button-ghost" onClick={copyBase64}>Copy Base64</button>
        </div>
      </div>

      {error && <p className="message error">{error}</p>}
      {!error && status && <p className="message success">{status}</p>}

      {result && (
        <div className="preview-card">
          <div className="meta-grid">
            <p><strong>MIME:</strong> {result.mime}</p>
            <p><strong>Size:</strong> {bytesToSize(result.sizeBytes)}</p>
            <p><strong>Preview:</strong> {result.previewKind}</p>
          </div>

          {kind === 'url' && result.textPreview && (
            <p className="link-preview">
              Parsed URL: <a href={result.textPreview} target="_blank" rel="noreferrer">{result.textPreview}</a>
            </p>
          )}

          <DecodedPreview
            previewKind={result.previewKind}
            objectUrl={result.objectUrl}
            textPreview={result.textPreview}
          />

          <div className="button-row">
            <button onClick={() => triggerDownload(result.blob, result.filename)}>Download decoded</button>
          </div>
        </div>
      )}
    </section>
  )
}
