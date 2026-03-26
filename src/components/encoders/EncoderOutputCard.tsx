import { useState } from 'react'
import { useI18n } from '../../i18n/useI18n'

interface EncoderOutputCardProps {
  base64Output: string
  error: string
  isProcessing: boolean
  outputRevision: number
  onBase64OutputChange: (value: string) => void
  onCopyBase64: () => Promise<boolean>
  onDownloadBase64: () => void
}

export function EncoderOutputCard({
  base64Output,
  error,
  isProcessing,
  outputRevision,
  onBase64OutputChange,
  onCopyBase64,
  onDownloadBase64,
}: EncoderOutputCardProps) {
  const { t } = useI18n()
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = async () => {
    const success = await onCopyBase64()
    if (!success) {
      return
    }

    setIsCopied(true)
    globalThis.setTimeout(() => {
      setIsCopied(false)
    }, 650)
  }

  const showPlaceholder = !base64Output && !error
  const copyLabel = isCopied ? t('common.copied') : t('encoders.output.copy')

  return (
    <article className={`output-block output-card${error ? ' is-invalid' : ''}`}>
      <h3 className="output-title">
        <span>{t('encoders.output.title')}</span>
        {isProcessing && <span className="output-status">{t('encoders.output.updating')}</span>}
      </h3>

      <div
        key={outputRevision}
        className={`output-textarea-wrap${
          isProcessing ? ' is-processing' : ''
        }${
          outputRevision > 0 ? ' is-refreshing' : ''
        }${
          isCopied ? ' is-copied' : ''
        }${
          error ? ' is-invalid' : ''
        }`}
      >
        <textarea
          className="output-textarea"
          value={base64Output}
          onChange={(event) => onBase64OutputChange(event.target.value)}
          rows={16}
          placeholder={t('encoders.output.placeholder')}
          aria-invalid={Boolean(error)}
        />

        <div className={`output-overlay output-placeholder${showPlaceholder ? ' is-visible' : ''}`}>
          {t('encoders.output.placeholder')}
        </div>

        <div className={`output-overlay output-feedback${error ? ' is-visible' : ''}`} role="status" aria-live="polite">
          {error}
        </div>

        <button
          type="button"
          className="output-copy-button"
          onClick={() => {
            void handleCopy()
          }}
          disabled={!base64Output}
          aria-label={copyLabel}
          title={copyLabel}
        >
          {isCopied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>

      <div className="button-row">
        <button
          type="button"
          className="button-ghost"
          onClick={onDownloadBase64}
          disabled={!base64Output}
        >
          {t('encoders.output.download')}
        </button>
      </div>
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
