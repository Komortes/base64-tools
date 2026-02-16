import { useMemo, useState } from 'react'
import { copyToClipboard } from '../utils/clipboard'

type SnippetKind = 'js' | 'python' | 'go' | 'bash'

interface CodeSnippetsProps {
  base64: string
  title?: string
}

const SNIPPET_LABELS: Record<SnippetKind, string> = {
  js: 'JS/TS',
  python: 'Python',
  go: 'Go',
  bash: 'Bash',
}

const INLINE_BASE64_LIMIT = 4096

function literalOrPlaceholder(base64: string, quote: '"' | '`'): string {
  const normalized = base64.trim()
  if (normalized.length <= INLINE_BASE64_LIMIT) {
    return quote === '`'
      ? `\`${normalized.replace(/`/g, '\\`')}\``
      : JSON.stringify(normalized)
  }

  return quote === '`'
    ? '`<paste-base64-here>`'
    : '"<paste-base64-here>"'
}

function buildSnippets(base64: string): Record<SnippetKind, string> {
  const quotedBase64 = literalOrPlaceholder(base64, '"')
  const backtickedBase64 = literalOrPlaceholder(base64, '`')

  return {
    js: `const base64 = ${quotedBase64};

const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
const text = new TextDecoder().decode(bytes); // optional for UTF-8 payloads

console.log(bytes);
console.log(text);`,
    python: `import base64

base64_value = ${quotedBase64}
decoded = base64.b64decode(base64_value)

print(decoded)
print(decoded.decode("utf-8", errors="replace"))  # optional`,
    go: `package main

import (
  "encoding/base64"
  "fmt"
)

func main() {
  base64Value := ${quotedBase64}
  decoded, err := base64.StdEncoding.DecodeString(base64Value)
  if err != nil {
    panic(err)
  }

  fmt.Printf("%x\\n", decoded)
  fmt.Println(string(decoded)) // optional for text payloads
}`,
    bash: `BASE64_VALUE=${backtickedBase64}
printf '%s' "$BASE64_VALUE" | base64 --decode > output.bin`,
  }
}

export function CodeSnippets({ base64, title = 'Developer Snippets' }: CodeSnippetsProps) {
  const [activeSnippet, setActiveSnippet] = useState<SnippetKind>('js')
  const [copyLabel, setCopyLabel] = useState('Copy snippet')

  const snippets = useMemo(() => buildSnippets(base64), [base64])

  if (!base64.trim()) {
    return null
  }

  const handleCopy = async () => {
    const copied = await copyToClipboard(snippets[activeSnippet])
    setCopyLabel(copied ? 'Copied' : 'Copy failed')

    globalThis.setTimeout(() => {
      setCopyLabel('Copy snippet')
    }, 1200)
  }

  return (
    <article className="preview-card snippet-card">
      <div className="snippet-head">
        <h3>{title}</h3>
        <button type="button" className="button-ghost" onClick={handleCopy}>
          {copyLabel}
        </button>
      </div>

      <div className="snippet-tab-row" role="tablist" aria-label="Snippet language">
        {(Object.keys(SNIPPET_LABELS) as SnippetKind[]).map((snippetKind) => (
          <button
            key={snippetKind}
            type="button"
            role="tab"
            aria-selected={activeSnippet === snippetKind}
            className={`snippet-tab${activeSnippet === snippetKind ? ' is-active' : ''}`}
            onClick={() => setActiveSnippet(snippetKind)}
          >
            {SNIPPET_LABELS[snippetKind]}
          </button>
        ))}
      </div>

      <pre className="snippet-code">{snippets[activeSnippet]}</pre>
      {base64.length > INLINE_BASE64_LIMIT && (
        <p className="field-note">
          Payload is large, so snippets include a placeholder instead of the full Base64 string.
        </p>
      )}
    </article>
  )
}
