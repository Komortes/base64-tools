import type { EncoderConfig, FileInputMode } from '../../configs/encoders'
import { selectedFileLabel } from '../../hooks/useEncodersState'

interface EncoderSourceCardProps {
  config: EncoderConfig
  textInput: string
  hexInput: string
  fileInputMode: FileInputMode
  selectedFile: File | null
  remoteFileUrl: string
  loadingRemoteFile: boolean
  isEncoding: boolean
  withDataUrlPrefix: boolean
  onTextInputChange: (value: string) => void
  onHexInputChange: (value: string) => void
  onFileInputModeChange: (value: FileInputMode) => void
  onSelectFile: (file: File | null) => void
  onRemoteFileUrlChange: (value: string) => void
  onLoadFromUrl: () => Promise<void>
  onToggleDataUrlPrefix: () => void
  onEncode: () => Promise<void>
  onClear: () => void
}

export function EncoderSourceCard({
  config,
  textInput,
  hexInput,
  fileInputMode,
  selectedFile,
  remoteFileUrl,
  loadingRemoteFile,
  isEncoding,
  withDataUrlPrefix,
  onTextInputChange,
  onHexInputChange,
  onFileInputModeChange,
  onSelectFile,
  onRemoteFileUrlChange,
  onLoadFromUrl,
  onToggleDataUrlPrefix,
  onEncode,
  onClear,
}: EncoderSourceCardProps) {
  return (
    <article className="preview-card source-card">
      <h3>Source</h3>

      {config.mode === 'file' && (
        <div className="upload-source-grid">
          <div className="source-mode-toggle" role="tablist" aria-label="File source mode">
            <button
              type="button"
              className={`source-mode-button${fileInputMode === 'local' ? ' is-active' : ''}`}
              onClick={() => onFileInputModeChange('local')}
            >
              Local file
            </button>
            <button
              type="button"
              className={`source-mode-button${fileInputMode === 'url' ? ' is-active' : ''}`}
              onClick={() => onFileInputModeChange('url')}
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
                  onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
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
                    onChange={(event) => onRemoteFileUrlChange(event.target.value)}
                    placeholder="https://example.com/file.pdf"
                  />
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={onLoadFromUrl}
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
          onChange={(event) => onTextInputChange(event.target.value)}
          rows={10}
          placeholder={config.placeholder}
        />
      )}

      {config.mode === 'hex' && (
        <textarea
          value={hexInput}
          onChange={(event) => onHexInputChange(event.target.value)}
          rows={10}
          placeholder={config.placeholder}
        />
      )}

      {config.mode === 'file' && (
        <p className="field-label">{selectedFileLabel(selectedFile)}</p>
      )}

      <div className="toggle-row">
        <button
          type="button"
          className={`toggle-chip${withDataUrlPrefix ? ' is-active' : ''}`}
          aria-pressed={withDataUrlPrefix}
          onClick={onToggleDataUrlPrefix}
        >
          <span>Include data URL prefix</span>
          <span
            className={`toggle-chip-indicator${withDataUrlPrefix ? ' is-active' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="button-row">
        <button onClick={onEncode} disabled={isEncoding || loadingRemoteFile}>
          Encode to Base64
        </button>
        <button
          type="button"
          className="button-ghost"
          onClick={onClear}
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
  )
}
