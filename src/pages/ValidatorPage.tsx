import { useMemo, useState } from 'react'
import { validateBase64 } from '../utils/base64'
import { copyToClipboard } from '../utils/clipboard'

export function ValidatorPage() {
  const [input, setInput] = useState('')
  const [stripWhitespace, setStripWhitespace] = useState(true)

  const result = useMemo(() => validateBase64(input, stripWhitespace), [input, stripWhitespace])

  const copyNormalized = async () => {
    await copyToClipboard(result.normalized)
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Base64 Validator</h2>
        <p>Checks alphabet, length, padding, and URL-safe compatibility.</p>
      </div>

      <label>
        <input
          type="checkbox"
          checked={stripWhitespace}
          onChange={(event) => setStripWhitespace(event.target.checked)}
        />
        Ignore whitespace
      </label>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={9}
        placeholder="Paste Base64"
      />

      {!!input && (
        <div className="preview-card">
          <p className={`validation-state ${result.isValid ? 'ok' : 'bad'}`}>
            {result.isValid ? 'Valid Base64' : 'Invalid Base64'}
          </p>

          <div className="meta-grid">
            <p><strong>Detected format:</strong> {result.format}</p>
            <p><strong>Normalized length:</strong> {result.normalized.length}</p>
          </div>

          <label className="field-label">Normalized output</label>
          <textarea readOnly rows={4} value={result.normalized} />

          <div className="button-row">
            <button onClick={copyNormalized}>Copy normalized</button>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h3>Errors</h3>
              <ul>
                {result.errors.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <h3>Warnings</h3>
              <ul>
                {result.warnings.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
