import { EncoderOutputCard } from '../components/encoders/EncoderOutputCard'
import { EncoderSourceCard } from '../components/encoders/EncoderSourceCard'
import { ModeSelector } from '../components/codec/ModeSelector'
import { ENCODER_CONFIGS } from '../configs/encoders'
import { useEncodersState } from '../hooks/useEncodersState'
import { useI18n } from '../i18n/useI18n'
import { encoderLabel, encoderPlaceholder } from '../i18n/toolStrings'

export function EncodersPage() {
  const { t } = useI18n()
  const {
    kind,
    config,
    textInput,
    hexInput,
    fileInputMode,
    selectedFile,
    remoteFileUrl,
    loadingRemoteFile,
    isEncoding,
    base64Output,
    withDataUrlPrefix,
    error,
    setTextInput,
    setHexInput,
    setFileInputMode,
    setSelectedFile,
    setRemoteFileUrl,
    setBase64Output,
    toggleWithDataUrlPrefix,
    handleTypeChange,
    handleLoadFromUrl,
    handleEncode,
    copyBase64,
    downloadBase64,
    clearAll,
  } = useEncodersState()

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>{t('encoders.title')}</h2>
        <p>{t('encoders.subtitle')}</p>
      </div>

      <ModeSelector
        activeKind={kind}
        items={ENCODER_CONFIGS.map(({ kind: modeKind }) => ({ kind: modeKind, label: encoderLabel(modeKind, t) }))}
        onSelect={handleTypeChange}
      />

      <EncoderSourceCard
        config={config}
        placeholder={encoderPlaceholder(config.kind, t)}
        textInput={textInput}
        hexInput={hexInput}
        fileInputMode={fileInputMode}
        selectedFile={selectedFile}
        remoteFileUrl={remoteFileUrl}
        loadingRemoteFile={loadingRemoteFile}
        isEncoding={isEncoding}
        withDataUrlPrefix={withDataUrlPrefix}
        onTextInputChange={setTextInput}
        onHexInputChange={setHexInput}
        onFileInputModeChange={setFileInputMode}
        onSelectFile={setSelectedFile}
        onRemoteFileUrlChange={setRemoteFileUrl}
        onLoadFromUrl={handleLoadFromUrl}
        onToggleDataUrlPrefix={toggleWithDataUrlPrefix}
        onEncode={handleEncode}
        onClear={clearAll}
      />

      <EncoderOutputCard
        base64Output={base64Output}
        onBase64OutputChange={setBase64Output}
        onCopyBase64={copyBase64}
        onDownloadBase64={downloadBase64}
      />

      {error && <p className="message error">{error}</p>}
    </section>
  )
}
