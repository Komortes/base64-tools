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
  return (
    <article className="output-block output-card">
      <h3>Base64 Output</h3>
      <textarea
        value={base64Output}
        onChange={(event) => onBase64OutputChange(event.target.value)}
        rows={16}
        placeholder="Encoded Base64 will appear here"
      />
      <div className="button-row">
        <button onClick={onCopyBase64} disabled={!base64Output}>Copy Base64</button>
        <button
          type="button"
          className="button-ghost"
          onClick={onDownloadBase64}
          disabled={!base64Output}
        >
          Download Base64
        </button>
      </div>
    </article>
  )
}
