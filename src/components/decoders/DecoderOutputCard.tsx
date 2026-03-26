import { useState } from 'react'
import { DecodedPreview } from '../DecodedPreview'
import type { DecoderKind } from '../../configs/decoders'
import { bytesToSize } from '../../utils/blob'
import type { DecodeMismatchWarning, DecodeResult } from '../../hooks/useDecodersState'
import { useI18n } from '../../i18n/useI18n'

interface DecoderOutputCardProps {
  result: DecodeResult | null
  mismatchWarning: DecodeMismatchWarning | null
  parsedUrl: string | null
  error: string
  isProcessing: boolean
  outputRevision: number
  onSwitchSuggestedKind: (kind: DecoderKind) => void
  onDownloadResult: (blob: Blob, filename: string) => void
  onCopyTextResult: () => Promise<boolean>
}

function inputModeLabel(mode: DecodeResult['inputMode'], t: (key: string) => string): string {
  if (mode === 'base64') return t('decoders.inputMode.base64')
  if (mode === 'data-url-base64') return t('decoders.inputMode.dataUrlBase64')
  return t('decoders.inputMode.dataUrlText')
}

export function DecoderOutputCard({
  result,
  mismatchWarning,
  parsedUrl,
  error,
  isProcessing,
  outputRevision,
  onSwitchSuggestedKind,
  onDownloadResult,
  onCopyTextResult,
}: DecoderOutputCardProps) {
  const { t } = useI18n()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    const success = await onCopyTextResult()
    if (!success) {
      return
    }

    setIsCopied(true)
    globalThis.setTimeout(() => {
      setIsCopied(false)
    }, 650)
  }

  const hasTextPreview = result?.previewKind === 'text'
  const copyLabel = isCopied ? t('common.copied') : t('decoders.action.copyText')

  return (
    <article className={`output-block output-card${error ? ' is-invalid' : ''}`}>
      <h3 className="output-title">
        <span>{t('decoders.output.title')}</span>
        {mismatchWarning && (
          <button
            type="button"
            className="warning-tag"
            onClick={() => onSwitchSuggestedKind(mismatchWarning.suggestedKind)}
          >
            <span>{mismatchWarning.message}</span>
            <span>{t('decoders.output.switchTo', { label: mismatchWarning.suggestedLabel })}</span>
          </button>
        )}
        {isProcessing && <span className="output-status">{t('decoders.output.updating')}</span>}
      </h3>

      {!result && (
        <div
          key={outputRevision}
          className={`output-state-panel${
            error ? ' is-invalid' : ''
          }${
            outputRevision > 0 ? ' is-refreshing' : ''
          }`}
          role="status"
          aria-live="polite"
        >
          {error || t('decoders.output.empty')}
        </div>
      )}

      {result && (
        <>
          <div className="meta-grid">
            <p><strong>{t('decoders.meta.mime')}</strong> {result.mime}</p>
            <p><strong>{t('decoders.meta.size')}</strong> {bytesToSize(result.sizeBytes)}</p>
            <p><strong>{t('decoders.meta.preview')}</strong> {result.previewKind}</p>
            <p><strong>{t('decoders.meta.inputMode')}</strong> {inputModeLabel(result.inputMode, t)}</p>
            <p><strong>{t('decoders.meta.detection')}</strong> {result.detection}</p>
            <p><strong>{t('decoders.meta.filename')}</strong> {result.filename}</p>
          </div>

          {parsedUrl && (
            <p className="link-preview">
              {t('decoders.parsedUrl')} <a href={parsedUrl} target="_blank" rel="noopener noreferrer">{parsedUrl}</a>
            </p>
          )}

          {hasTextPreview ? (
            <div
              key={outputRevision}
              className={`text-preview-shell${
                outputRevision > 0 ? ' is-refreshing' : ''
              }${
                isCopied ? ' is-copied' : ''
              }${
                isProcessing ? ' is-processing' : ''
              }`}
            >
              <button
                type="button"
                className="output-copy-button"
                onClick={() => {
                  void handleCopy()
                }}
                disabled={!result.textPreview}
                aria-label={copyLabel}
                title={copyLabel}
              >
                {isCopied ? <CheckIcon /> : <CopyIcon />}
              </button>
              <pre className="text-preview">{result.textPreview?.slice(0, 5000) ?? ''}</pre>
            </div>
          ) : (
            <DecodedPreview
              previewKind={result.previewKind}
              objectUrl={result.objectUrl}
              textPreview={result.textPreview}
            />
          )}

          <div className="button-row">
            <button onClick={() => onDownloadResult(result.blob, result.filename)}>{t('decoders.action.download')}</button>
          </div>
        </>
      )}
    </article>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}
