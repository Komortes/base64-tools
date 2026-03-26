import type { EncoderConfig, FileInputMode } from '../../configs/encoders'
import { bytesToSize } from '../../utils/blob'
import { useI18n } from '../../i18n/useI18n'

interface EncoderSourceCardProps {
  config: EncoderConfig
  placeholder: string
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
  sourceError: string
}

export function EncoderSourceCard({
  config,
  placeholder,
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
  sourceError,
}: EncoderSourceCardProps) {
  const { t } = useI18n()

  const fileLabel = selectedFile
    ? t('encoders.source.selected', { name: selectedFile.name, size: bytesToSize(selectedFile.size) })
    : t('encoders.source.none')

  return (
    <article className="preview-card source-card">
      <h3>{t('encoders.source.title')}</h3>

      {config.mode === 'file' && (
        <div className="upload-source-grid">
          <div className="source-mode-toggle" role="tablist" aria-label={t('encoders.source.modeLabel')}>
            <button
              type="button"
              className={`source-mode-button${fileInputMode === 'local' ? ' is-active' : ''}`}
              onClick={() => onFileInputModeChange('local')}
            >
              {t('encoders.source.local')}
            </button>
            <button
              type="button"
              className={`source-mode-button${fileInputMode === 'url' ? ' is-active' : ''}`}
              onClick={() => onFileInputModeChange('url')}
            >
              {t('encoders.source.url')}
            </button>
          </div>

          <section className="upload-source-block">
            {fileInputMode === 'local' ? (
              <>
                <label className="field-label" htmlFor="local-file-input">{t('encoders.source.local')}</label>
                <input
                  id="local-file-input"
                  type="file"
                  accept={config.accept}
                  onChange={(event) => onSelectFile(event.target.files?.[0] ?? null)}
                />
              </>
            ) : (
              <>
                <label className="field-label" htmlFor="remote-file-url">{t('encoders.source.url')}</label>
                <div className="url-load-row">
                  <input
                    id="remote-file-url"
                    type="url"
                    value={remoteFileUrl}
                    onChange={(event) => onRemoteFileUrlChange(event.target.value)}
                    placeholder={t('encoders.source.urlPlaceholder')}
                  />
                  <button
                    type="button"
                    className="button-ghost"
                    onClick={onLoadFromUrl}
                    disabled={loadingRemoteFile || isEncoding}
                  >
                    {loadingRemoteFile ? t('encoders.source.loading') : t('encoders.source.load')}
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
          placeholder={placeholder}
        />
      )}

      {config.mode === 'hex' && (
        <textarea
          value={hexInput}
          onChange={(event) => onHexInputChange(event.target.value)}
          rows={10}
          placeholder={placeholder}
        />
      )}

      {config.mode === 'file' && (
        <p className="field-label">{fileLabel}</p>
      )}

      <div className="toggle-row">
        <button
          type="button"
          className={`toggle-chip${withDataUrlPrefix ? ' is-active' : ''}`}
          aria-pressed={withDataUrlPrefix}
          onClick={onToggleDataUrlPrefix}
        >
          <span>{t('encoders.toggle.dataUrl')}</span>
          <span
            className={`toggle-chip-indicator${withDataUrlPrefix ? ' is-active' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="button-row">
        <button onClick={onEncode} disabled={isEncoding || loadingRemoteFile}>
          {t('encoders.action.encode')}
        </button>
        <button
          type="button"
          className="button-ghost"
          onClick={onClear}
          disabled={isEncoding || loadingRemoteFile}
        >
          {t('encoders.action.clear')}
        </button>
      </div>

      {sourceError && (
        <p className="message error" role="alert">
          {sourceError}
        </p>
      )}

      {(loadingRemoteFile || isEncoding) && (
        <div className="inline-loader" role="status" aria-live="polite">
          <span className="spinner" />
          <span>{loadingRemoteFile ? t('encoders.state.loadingUrl') : t('encoders.state.encoding')}</span>
        </div>
      )}
    </article>
  )
}
