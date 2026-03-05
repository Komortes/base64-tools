import { DecodedPreview } from '../DecodedPreview'
import type { DecoderKind } from '../../configs/decoders'
import { bytesToSize } from '../../utils/blob'
import type { DecodeMismatchWarning, DecodeResult } from '../../hooks/useDecodersState'
import { useI18n } from '../../i18n/useI18n'

interface DecoderOutputCardProps {
  result: DecodeResult | null
  mismatchWarning: DecodeMismatchWarning | null
  parsedUrl: string | null
  onSwitchSuggestedKind: (kind: DecoderKind) => void
  onDownloadResult: (blob: Blob, filename: string) => void
  onCopyTextResult: () => Promise<void> | void
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
  onSwitchSuggestedKind,
  onDownloadResult,
  onCopyTextResult,
}: DecoderOutputCardProps) {
  const { t } = useI18n()

  return (
    <article className="output-block output-card">
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
      </h3>

      {!result && <p className="hint-text">{t('decoders.output.empty')}</p>}

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
              Parsed URL: <a href={parsedUrl} target="_blank" rel="noopener noreferrer">{parsedUrl}</a>
            </p>
          )}

          <DecodedPreview
            previewKind={result.previewKind}
            objectUrl={result.objectUrl}
            textPreview={result.textPreview}
          />

          <div className="button-row">
            <button onClick={() => onDownloadResult(result.blob, result.filename)}>{t('decoders.action.download')}</button>
            {result.previewKind === 'text' && (
              <button type="button" className="button-ghost" onClick={onCopyTextResult}>
                {t('decoders.action.copyText')}
              </button>
            )}
          </div>
        </>
      )}
    </article>
  )
}
