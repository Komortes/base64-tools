import { useState } from 'react'
import { CheckIcon, CopyIcon } from '../icons'
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

