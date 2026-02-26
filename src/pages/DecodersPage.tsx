import { useEffect } from 'react'
import { DecoderInputCard } from '../components/decoders/DecoderInputCard'
import { DecoderOutputCard } from '../components/decoders/DecoderOutputCard'
import { ModeSelector } from '../components/codec/ModeSelector'
import { DECODER_CONFIGS } from '../configs/decoders'
import { useDecodersState } from '../hooks/useDecodersState'
import { useI18n } from '../i18n/useI18n'
import { decoderLabel } from '../i18n/toolStrings'
import { useToastStore } from '../store/toast'
import { triggerDownload } from '../utils/blob'

export function DecodersPage() {
  const { t } = useI18n()
  const pushToast = useToastStore((state) => state.pushToast)
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

  useEffect(() => {
    if (!error) {
      return
    }

    pushToast({ kind: 'error', message: error })
  }, [error, pushToast])

  const handleCopyTextResult = async () => {
    const success = await copyTextResult()
    pushToast({
      kind: success ? 'success' : 'error',
      message: t(success ? 'toast.copySuccess' : 'toast.copyError'),
    })
  }

  const handleDownloadResult = (blob: Blob, filename: string) => {
    try {
      triggerDownload(blob, filename)
      pushToast({ kind: 'success', message: t('toast.downloadSuccess') })
    } catch {
      pushToast({ kind: 'error', message: t('toast.downloadError') })
    }
  }

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
        onDownloadResult={handleDownloadResult}
        onCopyTextResult={handleCopyTextResult}
      />

      {error && <p className="message error" role="alert">{error}</p>}
    </section>
  )
}
