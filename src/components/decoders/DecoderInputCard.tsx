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
  return (
    <article className="preview-card source-card">
      <h3>Input</h3>

      <textarea
        value={input}
        onChange={(event) => onInputChange(event.target.value)}
        rows={14}
        placeholder="Paste Base64 or Data URL"
      />

      <input
        id="decode-mime-override"
        type="text"
        value={mimeOverride}
        onChange={(event) => onMimeOverrideChange(event.target.value)}
        placeholder="Optional MIME override (e.g. application/pdf)"
      />

      <div className="button-row">
        <button onClick={onDecode} disabled={isDecoding}>Decode</button>
        <button type="button" className="button-ghost" onClick={onClear} disabled={isDecoding}>
          Clear
        </button>
      </div>

      {isDecoding && (
        <div className="inline-loader" role="status" aria-live="polite">
          <span className="spinner" />
          <span>Decoding...</span>
        </div>
      )}
    </article>
  )
}
