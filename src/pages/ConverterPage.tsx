import { useState } from 'react'
import {
  decodeBase64ToText,
  encodeTextToBase64,
  normalizeBase64Input,
  toUrlSafeBase64,
  withoutPadding,
} from '../utils/base64'
import { copyToClipboard } from '../utils/clipboard'

export function ConverterPage() {
  const [text, setText] = useState('')
  const [base64, setBase64] = useState('')
  const [stripWhitespace, setStripWhitespace] = useState(true)
  const [normalizeUrlSafe, setNormalizeUrlSafe] = useState(true)
  const [autoPadding, setAutoPadding] = useState(true)
  const [urlSafeOutput, setUrlSafeOutput] = useState(false)
  const [removePaddingOnEncode, setRemovePaddingOnEncode] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const clearMessages = () => {
    setStatus('')
    setError('')
  }

  const handleEncode = () => {
    clearMessages()

    try {
      let encoded = encodeTextToBase64(text)

      if (urlSafeOutput) {
        encoded = toUrlSafeBase64(encoded)
      } else if (removePaddingOnEncode) {
        encoded = withoutPadding(encoded)
      }

      setBase64(encoded)
      setStatus('Text encoded to Base64.')
    } catch {
      setError('Failed to encode text. Check input and try again.')
    }
  }

  const handleDecode = () => {
    clearMessages()

    try {
      const normalized = normalizeBase64Input(base64, {
        stripWhitespace,
        normalizeUrlSafe,
        addPadding: autoPadding,
      })

      const decoded = decodeBase64ToText(normalized, {
        stripWhitespace: false,
        normalizeUrlSafe: false,
        addPadding: false,
      })

      setText(decoded)
      setStatus('Base64 decoded to text.')
    } catch {
      setError('Failed to decode Base64. Enable URL-safe normalize or padding if needed.')
    }
  }

  const handleSwap = () => {
    clearMessages()
    setText(base64)
    setBase64(text)
  }

  const handleClear = () => {
    setText('')
    setBase64('')
    clearMessages()
  }

  const handleCopy = async (value: string, label: string) => {
    const copied = await copyToClipboard(value)
    setStatus(copied ? `${label} copied.` : 'Copy failed. Clipboard permission may be blocked.')
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>Text ↔ Base64 Converter</h2>
        <p>Unicode-safe conversion using UTF-8 bytes.</p>
      </div>

      <div className="control-row">
        <label><input type="checkbox" checked={stripWhitespace} onChange={(event) => setStripWhitespace(event.target.checked)} /> Strip whitespace</label>
        <label><input type="checkbox" checked={normalizeUrlSafe} onChange={(event) => setNormalizeUrlSafe(event.target.checked)} /> Normalize URL-safe input</label>
        <label><input type="checkbox" checked={autoPadding} onChange={(event) => setAutoPadding(event.target.checked)} /> Auto-add padding</label>
        <label><input type="checkbox" checked={urlSafeOutput} onChange={(event) => setUrlSafeOutput(event.target.checked)} /> URL-safe output</label>
        <label><input type="checkbox" checked={removePaddingOnEncode} onChange={(event) => setRemovePaddingOnEncode(event.target.checked)} disabled={urlSafeOutput} /> Remove padding on encode</label>
      </div>

      <div className="tool-grid">
        <article className="input-card">
          <h3>Text</h3>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Enter plain text"
            rows={12}
          />
          <div className="button-row">
            <button onClick={handleEncode}>Encode →</button>
            <button className="button-ghost" onClick={() => handleCopy(text, 'Text')}>Copy</button>
          </div>
        </article>

        <article className="input-card">
          <h3>Base64</h3>
          <textarea
            value={base64}
            onChange={(event) => setBase64(event.target.value)}
            placeholder="Paste Base64 or URL-safe Base64"
            rows={12}
          />
          <div className="button-row">
            <button onClick={handleDecode}>← Decode</button>
            <button className="button-ghost" onClick={() => handleCopy(base64, 'Base64')}>Copy</button>
          </div>
        </article>
      </div>

      <div className="button-row">
        <button className="button-ghost" onClick={handleSwap}>Swap</button>
        <button className="button-ghost" onClick={handleClear}>Clear</button>
      </div>

      {error && <p className="message error">{error}</p>}
      {!error && status && <p className="message success">{status}</p>}
    </section>
  )
}
