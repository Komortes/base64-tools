import { useMemo, useState } from 'react'
import { CodeSnippets } from '../components/CodeSnippets'
import { ModeSelector } from '../components/codec/ModeSelector'
import { ENCODER_CONFIGS, type EncoderKind, type FileInputMode } from '../configs/encoders'
import { blobToBase64, bytesToBase64 } from '../utils/base64'
import { bytesToSize, triggerDownload } from '../utils/blob'
import { encodeBytesToBase64InWorker } from '../utils/base64Worker'
import { copyToClipboard } from '../utils/clipboard'
import { extractPayload } from '../utils/dataUrl'
import { hexToBytes } from '../utils/hex'
import { filenameFromUrl } from '../utils/urlFile'

const WORKER_THRESHOLD_BYTES = 512 * 1024

export function EncodersPage() {
  const [kind, setKind] = useState<EncoderKind>('text')
  const [textInput, setTextInput] = useState('')
  const [hexInput, setHexInput] = useState('')
  const [fileInputMode, setFileInputMode] = useState<FileInputMode>('local')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [remoteFileUrl, setRemoteFileUrl] = useState('')
  const [loadingRemoteFile, setLoadingRemoteFile] = useState(false)
  const [isEncoding, setIsEncoding] = useState(false)
  const [base64Output, setBase64Output] = useState('')
  const [withDataUrlPrefix, setWithDataUrlPrefix] = useState(false)
  const [error, setError] = useState('')

  const config = useMemo(
    () => ENCODER_CONFIGS.find((entry) => entry.kind === kind) ?? ENCODER_CONFIGS[0],
    [kind],
  )
  const outputPayload = useMemo(() => {
    if (!base64Output.trim()) {
      return ''
    }

    return extractPayload(base64Output).payload.trim()
  }, [base64Output])

  const resetMessages = () => {
    setError('')
  }

  const handleTypeChange = (nextType: EncoderKind) => {
    setKind(nextType)
    setTextInput('')
    setHexInput('')
    setFileInputMode('local')
    setSelectedFile(null)
    setRemoteFileUrl('')
    setLoadingRemoteFile(false)
    setBase64Output('')
    resetMessages()
  }

  const handleLoadFromUrl = async () => {
    resetMessages()

    if (!remoteFileUrl.trim()) {
      setError('Enter a file URL first.')
      return
    }

    if (config.mode !== 'file') {
      setError('URL loading is available only for file-based encoders.')
      return
    }

    setLoadingRemoteFile(true)

    try {
      const response = await fetch(remoteFileUrl.trim())
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`)
      }

      const blob = await response.blob()
      const fallbackName = `remote-${kind}`
      const guessedName = filenameFromUrl(remoteFileUrl.trim(), fallbackName, config.extension)
      const mime = blob.type || config.defaultMime
      const file = new File([blob], guessedName, { type: mime })
      setSelectedFile(file)
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load file from URL.'
      setError(`Cannot load by URL. ${message} This can fail if CORS is blocked.`)
    } finally {
      setLoadingRemoteFile(false)
    }
  }

  const handleEncode = async () => {
    resetMessages()

    if (config.mode === 'file' && !selectedFile) {
      setError('Choose a file before encoding.')
      return
    }

    setIsEncoding(true)

    try {
      let mime = config.defaultMime
      let encoded = ''

      if (config.mode === 'file') {
        const fileToEncode = selectedFile
        if (!fileToEncode) {
          throw new Error('Choose a file before encoding.')
        }

        encoded = await blobToBase64(fileToEncode)
        if (fileToEncode.type) {
          mime = fileToEncode.type
        }
      } else if (config.mode === 'hex') {
        const bytes = hexToBytes(hexInput)
        encoded =
          bytes.length >= WORKER_THRESHOLD_BYTES
            ? await encodeBytesToBase64InWorker(bytes)
            : bytesToBase64(bytes)
      } else {
        const bytes = new TextEncoder().encode(textInput)
        encoded =
          bytes.length >= WORKER_THRESHOLD_BYTES
            ? await encodeBytesToBase64InWorker(bytes)
            : bytesToBase64(bytes)
      }

      const output = withDataUrlPrefix ? `data:${mime};base64,${encoded}` : encoded
      setBase64Output(output)
    } catch (encodeError) {
      const message = encodeError instanceof Error ? encodeError.message : 'Encode failed.'
      setError(message)
    } finally {
      setIsEncoding(false)
    }
  }

  const copyBase64 = async () => {
    await copyToClipboard(base64Output)
  }

  const downloadBase64 = () => {
    const blob = new Blob([base64Output], { type: 'text/plain;charset=utf-8' })
    triggerDownload(blob, `${kind}-base64.txt`)
  }

  const clearAll = () => {
    setTextInput('')
    setHexInput('')
    setSelectedFile(null)
    setRemoteFileUrl('')
    setBase64Output('')
    resetMessages()
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Encoders</h2>
        <p>Encode source data to Base64. Decoding is now available on the Decoders page.</p>
      </div>

      <ModeSelector
        activeKind={kind}
        items={ENCODER_CONFIGS.map(({ kind: modeKind, label }) => ({ kind: modeKind, label }))}
        onSelect={handleTypeChange}
      />

      <article className="preview-card source-card">
        <h3>Source</h3>

        {config.mode === 'file' && (
          <div className="upload-source-grid">
            <div className="source-mode-toggle" role="tablist" aria-label="File source mode">
              <button
                type="button"
                className={`source-mode-button${fileInputMode === 'local' ? ' is-active' : ''}`}
                onClick={() => setFileInputMode('local')}
              >
                Local file
              </button>
              <button
                type="button"
                className={`source-mode-button${fileInputMode === 'url' ? ' is-active' : ''}`}
                onClick={() => setFileInputMode('url')}
              >
                File URL
              </button>
            </div>

            <section className="upload-source-block">
              {fileInputMode === 'local' ? (
                <>
                  <label className="field-label" htmlFor="local-file-input">Local file</label>
                  <input
                    id="local-file-input"
                    type="file"
                    accept={config.accept}
                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  />
                </>
              ) : (
                <>
                  <label className="field-label" htmlFor="remote-file-url">File URL</label>
                  <div className="url-load-row">
                    <input
                      id="remote-file-url"
                      type="url"
                      value={remoteFileUrl}
                      onChange={(event) => setRemoteFileUrl(event.target.value)}
                      placeholder="https://example.com/file.pdf"
                    />
                    <button
                      type="button"
                      className="button-ghost"
                      onClick={handleLoadFromUrl}
                      disabled={loadingRemoteFile || isEncoding}
                    >
                      {loadingRemoteFile ? 'Loading...' : 'Load'}
                    </button>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {config.mode === 'text' && (
          <textarea
            value={textInput}
            onChange={(event) => setTextInput(event.target.value)}
            rows={10}
            placeholder={config.placeholder}
          />
        )}

        {config.mode === 'hex' && (
          <textarea
            value={hexInput}
            onChange={(event) => setHexInput(event.target.value)}
            rows={10}
            placeholder={config.placeholder}
          />
        )}

        {config.mode === 'file' && (
          <p className="field-label">
            {selectedFile
              ? `Selected: ${selectedFile.name} (${bytesToSize(selectedFile.size)})`
              : 'No file selected'}
          </p>
        )}

        <div className="toggle-row">
          <button
            type="button"
            className={`toggle-chip${withDataUrlPrefix ? ' is-active' : ''}`}
            aria-pressed={withDataUrlPrefix}
            onClick={() => setWithDataUrlPrefix((prev) => !prev)}
          >
            <span>Include data URL prefix</span>
            <span
              className={`toggle-chip-indicator${withDataUrlPrefix ? ' is-active' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="button-row">
          <button onClick={handleEncode} disabled={isEncoding || loadingRemoteFile}>
            Encode to Base64
          </button>
          <button
            type="button"
            className="button-ghost"
            onClick={clearAll}
            disabled={isEncoding || loadingRemoteFile}
          >
            Clear
          </button>
        </div>

        {(loadingRemoteFile || isEncoding) && (
          <div className="inline-loader" role="status" aria-live="polite">
            <span className="spinner" />
            <span>{loadingRemoteFile ? 'Loading file from URL...' : 'Encoding...'}</span>
          </div>
        )}
      </article>

      <article className="output-block output-card">
        <h3>Base64 Output</h3>
        <textarea
          value={base64Output}
          onChange={(event) => setBase64Output(event.target.value)}
          rows={16}
          placeholder="Encoded Base64 will appear here"
        />
        <div className="button-row">
          <button onClick={copyBase64} disabled={!base64Output}>Copy Base64</button>
          <button
            type="button"
            className="button-ghost"
            onClick={downloadBase64}
            disabled={!base64Output}
          >
            Download Base64
          </button>
        </div>
      </article>
      <CodeSnippets base64={outputPayload} title="Use This Base64 in Code" />

      {error && <p className="message error">{error}</p>}
    </section>
  )
}
