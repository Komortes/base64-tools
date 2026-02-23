import { useI18n } from '../../i18n/useI18n'

interface DecoderInputCardProps {
  input: string
  mimeOverride: string
  isDecoding: boolean
  onInputChange: (value: string) => void
  onMimeOverrideChange: (value: string) => void
  onDecode: () => Promise<void>
  onClear: () => void
}

export function DecoderInputCard({
  input,
  mimeOverride,
  isDecoding,
  onInputChange,
  onMimeOverrideChange,
  onDecode,
  onClear,
}: DecoderInputCardProps) {
  const { t } = useI18n()

  return (
    <article className="preview-card source-card">
      <h3>{t('decoders.input.title')}</h3>

      <textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        rows={14}
        placeholder={t('decoders.input.placeholder')}
      />

      <input
        id="decode-mime-override"
        type="text"
        value={mimeOverride}
        onChange={(event) => onMimeOverrideChange(event.target.value)}
        placeholder={t('decoders.input.mimePlaceholder')}
      />

      <div className="button-row">
        <button onClick={onDecode} disabled={isDecoding}>{t('decoders.action.decode')}</button>
        <button type="button" className="button-ghost" onClick={onClear} disabled={isDecoding}>
          {t('decoders.action.clear')}
        </button>
      </div>

      {isDecoding && (
        <div className="inline-loader" role="status" aria-live="polite">
          <span className="spinner" />
          <span>{t('decoders.state.decoding')}</span>
        </div>
      )}
    </article>
  )
}
