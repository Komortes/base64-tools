import { useEffect, useMemo, useRef, useState } from 'react'
import { normalizeBase64Input, toUrlSafeBase64, validateBase64 } from '../utils/base64'
import { copyToClipboard } from '../utils/clipboard'
import { useI18n } from '../i18n/useI18n'

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

function buildHighlightAnalysis(
  input: string,
  stripWhitespace: boolean,
  t: (key: string) => string,
): HighlightAnalysis {
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
          reason: t('validator.reason.whitespaceIgnored'),
        }
      } else {
        tokens[index] = {
          char: visualizeChar(char),
          level: 'error',
          reason: t('validator.reason.whitespaceInvalid'),
        }
      }
      continue
    }

    if (!isBase64AlphabetChar(char)) {
      tokens[index] = {
        char,
        level: 'error',
        reason: t('validator.reason.nonBase64'),
      }
      continue
    }

    if (mixedAlphabet && /[+/\-_]/.test(char)) {
      tokens[index] = {
        char,
        level: 'error',
        reason: t('validator.reason.mixedAlphabet'),
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
          reason: t('validator.reason.paddingEnd'),
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
  const { t } = useI18n()
  const [input, setInput] = useState('')
  const [stripWhitespace, setStripWhitespace] = useState(true)
  const highlightRef = useRef<HTMLPreElement | null>(null)

  const result = useMemo(() => validateBase64(input, stripWhitespace), [input, stripWhitespace])
  const highlight = useMemo(
    () => buildHighlightAnalysis(input, stripWhitespace, t),
    [input, stripWhitespace, t],
  )

  useEffect(() => {
    if (highlight.firstErrorIndex === null) {
      return
    }

    const container = highlightRef.current
    if (!container) {
      return
    }

    const firstErrorNode = container.querySelector<HTMLElement>(
      `[data-char-index="${highlight.firstErrorIndex}"]`,
    )
    if (!firstErrorNode) {
      return
    }

    firstErrorNode.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }, [highlight.firstErrorIndex, input, stripWhitespace])

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

  const translatedFormat =
    result.format === 'standard'
      ? t('validator.format.standard')
      : result.format === 'url-safe'
        ? t('validator.format.url-safe')
        : t('validator.format.mixed')

  const translateValidationIssue = (issue: string): string => {
    if (issue === 'Input is empty.') return t('validator.issue.inputEmpty')
    if (issue === 'Input mixes standard and URL-safe alphabets.') return t('validator.issue.mixedAlphabet')
    if (issue === 'Input contains non-Base64 characters.') return t('validator.issue.invalidChars')
    if (issue === 'Padding must be only at the end.') return t('validator.issue.paddingAtEnd')
    if (issue === 'Padding cannot contain more than 2 "=" characters.') return t('validator.issue.paddingTooLong')
    if (issue === 'Invalid length: Base64 length modulo 4 cannot be 1.') return t('validator.issue.invalidLength')
    if (issue === 'Length is not divisible by 4. Decoder may require padding.') return t('validator.issue.lengthWarning')
    if (issue === 'Whitespace was ignored during validation.') return t('validator.issue.whitespaceIgnored')
    return issue
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>{t('validator.title')}</h2>
        <p>{t('validator.subtitle')}</p>
      </div>

      <label>
        <input
          type="checkbox"
          checked={stripWhitespace}
          onChange={(event) => setStripWhitespace(event.target.checked)}
        />
        {t('validator.ignoreWhitespace')}
      </label>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={9}
        placeholder={t('validator.input.placeholder')}
      />

      {!!input && (
        <div className="button-row">
          <button type="button" className="button-ghost" onClick={fixPadding}>
            {t('validator.action.fixPadding')}
          </button>
          <button type="button" className="button-ghost" onClick={convertToUrlSafe}>
            {t('validator.action.convertUrlSafe')}
          </button>
          <button type="button" className="button-ghost" onClick={removeWhitespace}>
            {t('validator.action.removeWhitespace')}
          </button>
          <button type="button" className="button-ghost" onClick={applyNormalized}>
            {t('validator.action.applyNormalized')}
          </button>
        </div>
      )}

      {!!input && (
        <div className="preview-card">
          <p className={`validation-state ${result.isValid ? 'ok' : 'bad'}`}>
            {result.isValid ? t('validator.state.valid') : t('validator.state.invalid')}
          </p>

          <div className="meta-grid">
            <p><strong>{t('validator.meta.detectedFormat')}</strong> {translatedFormat}</p>
            <p><strong>{t('validator.meta.normalizedLength')}</strong> {result.normalized.length}</p>
            <p>
              <strong>{t('validator.meta.firstError')}</strong>{' '}
              {highlight.firstErrorIndex === null ? t('validator.meta.na') : highlight.firstErrorIndex + 1}
            </p>
          </div>

          <div className="validator-highlight-wrap">
            <p className="field-label">{t('validator.inputMap.title')}</p>
            <pre ref={highlightRef} className="validator-highlight" aria-live="polite">
              {highlight.tokens.map((token, index) => (
                <span
                  key={`${index}-${token.char}`}
                  className={`validator-highlight-char${
                    token.level ? ` is-${token.level}` : ''
                  }${
                    highlight.firstErrorIndex === index ? ' is-first-error' : ''
                  }`}
                  data-char-index={index}
                  title={token.reason ?? undefined}
                >
                  {token.char}
                </span>
              ))}
            </pre>
            <p className="validator-legend">
              <span className="legend-chip is-error">{t('validator.legend.error')}</span>
              <span className="legend-chip is-warning">{t('validator.legend.warning')}</span>
            </p>
          </div>

          <label className="field-label">{t('validator.normalizedOutput')}</label>
          <textarea readOnly rows={4} value={result.normalized} />

          <div className="button-row">
            <button onClick={copyNormalized}>{t('validator.action.copyNormalized')}</button>
          </div>

          {result.errors.length > 0 && (
            <div>
              <h3>{t('validator.errors')}</h3>
              <ul>
                {result.errors.map((issue) => (
                  <li key={issue}>{translateValidationIssue(issue)}</li>
                ))}
              </ul>
            </div>
          )}

          {result.warnings.length > 0 && (
            <div>
              <h3>{t('validator.warnings')}</h3>
              <ul>
                {result.warnings.map((issue) => (
                  <li key={issue}>{translateValidationIssue(issue)}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
