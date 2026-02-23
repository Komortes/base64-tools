import { DecoderInputCard } from '../components/decoders/DecoderInputCard'
import { DecoderOutputCard } from '../components/decoders/DecoderOutputCard'
import { ModeSelector } from '../components/codec/ModeSelector'
import { DECODER_CONFIGS } from '../configs/decoders'
import { useDecodersState } from '../hooks/useDecodersState'

export function DecodersPage() {
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
        <h2>Decoders</h2>
        <p>Decode Base64 or Data URL into files, text, media, or auto-detected payloads.</p>
      </div>

      <ModeSelector
        activeKind={kind}
        items={DECODER_CONFIGS.map(({ kind: modeKind, label }) => ({ kind: modeKind, label }))}
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
