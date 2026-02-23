import { DecodedPreview } from '../DecodedPreview'
import type { DecoderKind } from '../../configs/decoders'
import { bytesToSize, triggerDownload } from '../../utils/blob'
import type { DecodeMismatchWarning, DecodeResult } from '../../hooks/useDecodersState'

interface DecoderOutputCardProps {
  result: DecodeResult | null
  mismatchWarning: DecodeMismatchWarning | null
  parsedUrl: string | null
  onSwitchSuggestedKind: (kind: DecoderKind) => void
  onCopyTextResult: () => Promise<boolean>
}

function inputModeLabel(mode: DecodeResult['inputMode']): string {
  if (mode === 'base64') return 'Plain Base64'
  if (mode === 'data-url-base64') return 'Data URL (base64)'
  return 'Data URL (plain payload)'
}

export function DecoderOutputCard({
  result,
  mismatchWarning,
  parsedUrl,
  onSwitchSuggestedKind,
  onCopyTextResult,
}: DecoderOutputCardProps) {
  return (
    <article className="output-block output-card">
      <h3 className="output-title">
        <span>Decoded Output</span>
        {mismatchWarning && (
          <button
            type="button"
            className="warning-tag"
            onClick={() => onSwitchSuggestedKind(mismatchWarning.suggestedKind)}
          >
            <span>{mismatchWarning.message}</span>
            <span>Switch to {mismatchWarning.suggestedLabel}</span>
          </button>
        )}
      </h3>

      {!result && <p className="hint-text">Decode payload to see preview and download options.</p>}

      {result && (
        <>
          <div className="meta-grid">
            <p><strong>MIME:</strong> {result.mime}</p>
            <p><strong>Size:</strong> {bytesToSize(result.sizeBytes)}</p>
            <p><strong>Preview:</strong> {result.previewKind}</p>
            <p><strong>Input mode:</strong> {inputModeLabel(result.inputMode)}</p>
            <p><strong>Detection:</strong> {result.detection}</p>
            <p><strong>Filename:</strong> {result.filename}</p>
          </div>

          {parsedUrl && (
            <p className="link-preview">
              Parsed URL: <a href={parsedUrl} target="_blank" rel="noreferrer">{parsedUrl}</a>
            </p>
          )}

          <DecodedPreview
            previewKind={result.previewKind}
            objectUrl={result.objectUrl}
            textPreview={result.textPreview}
          />

          <div className="button-row">
            <button onClick={() => triggerDownload(result.blob, result.filename)}>Download</button>
            {result.previewKind === 'text' && (
              <button type="button" className="button-ghost" onClick={onCopyTextResult}>
                Copy text
              </button>
            )}
          </div>
        </>
      )}
    </article>
  )
}
