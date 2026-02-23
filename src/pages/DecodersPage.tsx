import { DecoderInputCard } from '../components/decoders/DecoderInputCard'
import { DecoderOutputCard } from '../components/decoders/DecoderOutputCard'
import { ModeSelector } from '../components/codec/ModeSelector'
import { DECODER_CONFIGS } from '../configs/decoders'
import { useDecodersState } from '../hooks/useDecodersState'
import { useI18n } from '../i18n/useI18n'
import { decoderLabel } from '../i18n/toolStrings'

export function DecodersPage() {
  const { t } = useI18n()
  const {
    kind,
    input,
    mimeOverride,
    isDecoding,
    result,
    mismatchWarning,
    parsedUrl,
    error,
    setInput,
    setMimeOverride,
    handleTypeChange,
    handleDecode,
    copyTextResult,
    clearAll,
  } = useDecodersState()

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>{t('decoders.title')}</h2>
        <p>{t('decoders.subtitle')}</p>
      </div>

      <ModeSelector
        activeKind={kind}
        items={DECODER_CONFIGS.map(({ kind: modeKind }) => ({ kind: modeKind, label: decoderLabel(modeKind, t) }))}
        onSelect={handleTypeChange}
      />

      <DecoderInputCard
        input={input}
        mimeOverride={mimeOverride}
        isDecoding={isDecoding}
        onInputChange={setInput}
        onMimeOverrideChange={setMimeOverride}
        onDecode={handleDecode}
        onClear={clearAll}
      />

      <DecoderOutputCard
        result={result}
        mismatchWarning={mismatchWarning}
        parsedUrl={parsedUrl}
        onSwitchSuggestedKind={handleTypeChange}
        onCopyTextResult={copyTextResult}
      />

      {error && <p className="message error">{error}</p>}
    </section>
  )
}
