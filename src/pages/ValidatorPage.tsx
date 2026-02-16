import { useMemo, useState } from 'react'
import { normalizeBase64Input, toUrlSafeBase64, validateBase64 } from '../utils/base64'
import { copyToClipboard } from '../utils/clipboard'

type HighlightLevel = 'error' | 'warning' | null

interface HighlightToken {
  char: string
  level: HighlightLevel
  reason: string | null
}

interface HighlightAnalysis {
  tokens: HighlightToken[]
  firstErrorIndex: number | null
}

function isWhitespace(char: string): boolean {
  return /\s/.test(char)
}

function isBase64AlphabetChar(char: string): boolean {
  return /[A-Za-z0-9+/=_-]/.test(char)
}

function visualizeChar(char: string): string {
  if (char === ' ') {
    return '·'
  }

  if (char === '\t') {
    return '⇥'
  }

  return char
}

function buildHighlightAnalysis(input: string, stripWhitespace: boolean): HighlightAnalysis {
  const chars = [...input]
  const nonWhitespaceChars = chars.filter((char) => !isWhitespace(char))
  const hasStdAlphabet = nonWhitespaceChars.some((char) => char === '+' || char === '/')
  const hasUrlAlphabet = nonWhitespaceChars.some((char) => char === '-' || char === '_')
  const mixedAlphabet = hasStdAlphabet && hasUrlAlphabet

  const tokens: HighlightToken[] = chars.map((char) => ({
    char: visualizeChar(char),
    level: null,
    reason: null,
  }))

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index]

    if (isWhitespace(char)) {
      if (stripWhitespace) {
        tokens[index] = {
          char: visualizeChar(char),
          level: 'warning',
          reason: 'Whitespace ignored',
        }
      } else {
        tokens[index] = {
          char: visualizeChar(char),
          level: 'error',
          reason: 'Whitespace is not valid Base64',
        }
      }
      continue
    }

    if (!isBase64AlphabetChar(char)) {
      tokens[index] = {
        char,
        level: 'error',
        reason: 'Non-Base64 symbol',
      }
      continue
    }

    if (mixedAlphabet && /[+/\-_]/.test(char)) {
      tokens[index] = {
        char,
        level: 'error',
        reason: 'Mixed standard and URL-safe alphabets',
      }
      continue
    }

    if (char === '=') {
      const hasNonPaddingAfter = chars
        .slice(index + 1)
        .some((nextChar) => !isWhitespace(nextChar) && nextChar !== '=')

      if (hasNonPaddingAfter) {
        tokens[index] = {
          char,
          level: 'error',
          reason: 'Padding must be at the end',
        }
      }
    }
  }

  const firstErrorIndex = tokens.findIndex((token) => token.level === 'error')

  return {
    tokens,
    firstErrorIndex: firstErrorIndex === -1 ? null : firstErrorIndex,
  }
}

export function ValidatorPage() {
  const [input, setInput] = useState('')
  const [stripWhitespace, setStripWhitespace] = useState(true)

  const result = useMemo(() => validateBase64(input, stripWhitespace), [input, stripWhitespace])
  const highlight = useMemo(
    () => buildHighlightAnalysis(input, stripWhitespace),
    [input, stripWhitespace],
  )

  const copyNormalized = async () => {
    await copyToClipboard(result.normalized)
  }

  const applyNormalized = () => {
    setInput(result.normalized)
  }

  const removeWhitespace = () => {
    setInput((prev) => prev.replace(/\s+/g, ''))
  }

  const convertToUrlSafe = () => {
    const normalized = normalizeBase64Input(input, {
      stripWhitespace: true,
      normalizeUrlSafe: true,
      addPadding: true,
    })
    setInput(toUrlSafeBase64(normalized))
  }

  const fixPadding = () => {
    const clean = input.replace(/\s+/g, '')
    const withoutPadding = clean.replace(/=+$/g, '')
    const remainder = withoutPadding.length % 4
    const fixed =
      remainder === 0
        ? withoutPadding
        : withoutPadding + '='.repeat(4 - remainder)

    setInput(fixed)
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
        <div className="button-row">
          <button type="button" className="button-ghost" onClick={fixPadding}>
            Fix padding
          </button>
          <button type="button" className="button-ghost" onClick={convertToUrlSafe}>
            Convert URL-safe
          </button>
          <button type="button" className="button-ghost" onClick={removeWhitespace}>
            Remove whitespace
          </button>
          <button type="button" className="button-ghost" onClick={applyNormalized}>
            Apply normalized
          </button>
        </div>
      )}

      {!!input && (
        <div className="preview-card">
          <p className={`validation-state ${result.isValid ? 'ok' : 'bad'}`}>
            {result.isValid ? 'Valid Base64' : 'Invalid Base64'}
          </p>

          <div className="meta-grid">
            <p><strong>Detected format:</strong> {result.format}</p>
            <p><strong>Normalized length:</strong> {result.normalized.length}</p>
            <p>
              <strong>First error at:</strong>{' '}
              {highlight.firstErrorIndex === null ? 'n/a' : highlight.firstErrorIndex + 1}
            </p>
          </div>

          <div className="validator-highlight-wrap">
            <p className="field-label">Input map (errors/warnings)</p>
            <pre className="validator-highlight" aria-live="polite">
              {highlight.tokens.map((token, index) => (
                <span
                  key={`${index}-${token.char}`}
                  className={`validator-highlight-char${
                    token.level ? ` is-${token.level}` : ''
                  }`}
                  title={token.reason ?? undefined}
                >
                  {token.char}
                </span>
              ))}
            </pre>
            <p className="validator-legend">
              <span className="legend-chip is-error">Error</span>
              <span className="legend-chip is-warning">Warning</span>
            </p>
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
