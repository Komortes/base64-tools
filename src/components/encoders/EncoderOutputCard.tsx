import { useI18n } from '../../i18n/useI18n'

interface EncoderOutputCardProps {
  base64Output: string
  onBase64OutputChange: (value: string) => void
  onCopyBase64: () => Promise<boolean>
  onDownloadBase64: () => void
}

export function EncoderOutputCard({
  base64Output,
  onBase64OutputChange,
  onCopyBase64,
  onDownloadBase64,
}: EncoderOutputCardProps) {
  const { t } = useI18n()

  return (
    <article className="output-block output-card">
      <h3>{t('encoders.output.title')}</h3>
      <textarea
        value={base64Output}
        onChange={(event) => onBase64OutputChange(event.target.value)}
        rows={16}
        placeholder={t('encoders.output.placeholder')}
      />
      <div className="button-row">
        <button onClick={onCopyBase64} disabled={!base64Output}>{t('encoders.output.copy')}</button>
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
