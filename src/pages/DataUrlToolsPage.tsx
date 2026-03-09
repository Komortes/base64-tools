import { useEffect, useMemo, useState } from 'react'
import { DecodedPreview } from '../components/DecodedPreview'
import { base64ToBytes } from '../utils/base64'
import { bytesToSize, triggerDownload } from '../utils/blob'
import { copyToClipboard } from '../utils/clipboard'
import { decodeDataUrlTextPayload, parseDataUrl } from '../utils/dataUrl'
import { extensionFromMime, type PreviewKind } from '../utils/fileType'
import { useObjectUrlLifecycle } from '../hooks/useObjectUrlLifecycle'
import { buildBinaryPreview } from '../utils/decodedPreview'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../store/toast'

interface DataUrlPreviewState {
  blob?: Blob
  objectUrl?: string
  previewKind: PreviewKind
  mime: string
  extension: string
  sizeBytes?: number
  textPreview: string | null
}

function utf8ByteLength(value: string): number {
  return new TextEncoder().encode(value).length
}

export function DataUrlToolsPage() {
  const { t } = useI18n()
  const pushToast = useToastStore((state) => state.pushToast)
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [previewState, setPreviewState] = useState<DataUrlPreviewState | null>(null)

  const { setObjectUrl, revokeObjectUrl } = useObjectUrlLifecycle()

  const parsed = useMemo(() => parseDataUrl(input), [input])

  useEffect(() => {
    let cancelled = false

    const buildPreview = async () => {
      revokeObjectUrl()

      if (!parsed) {
        setPreviewState(null)
        return
      }

      if (!parsed.isBase64) {
        const decodedText = decodeDataUrlTextPayload(parsed.payload)
        if (cancelled) {
          return
        }

        setPreviewState({
          previewKind: 'text',
          mime: parsed.mime || 'text/plain;charset=utf-8',
          extension: extensionFromMime(parsed.mime || 'text/plain;charset=utf-8'),
          sizeBytes: utf8ByteLength(decodedText),
          textPreview: decodedText,
        })
        return
      }

      try {
        const bytes = base64ToBytes(parsed.payload, {
          stripWhitespace: true,
          normalizeUrlSafe: true,
          addPadding: true,
        })

        const binaryPreview = await buildBinaryPreview(bytes, parsed.mime)
        const { detected, blob, textPreview } = binaryPreview
        const objectUrl = URL.createObjectURL(blob)

        if (cancelled) {
          URL.revokeObjectURL(objectUrl)
          return
        }

        setObjectUrl(objectUrl)
        setPreviewState({
          blob,
          objectUrl,
          previewKind: detected.previewKind,
          mime: detected.mime,
          extension: detected.extension,
          sizeBytes: bytes.length,
          textPreview,
        })
      } catch {
        if (!cancelled) {
          setPreviewState(null)
        }
      }
    }

    buildPreview()

    return () => {
      cancelled = true
    }
  }, [parsed, revokeObjectUrl, setObjectUrl])

  useEffect(() => {
    if (!error) {
      return
    }

    pushToast({ kind: 'error', message: error })
  }, [error, pushToast])

  const handleCopyPayload = async () => {
    setError('')
    if (!parsed) {
      setError(t('dataUrl.error.invalidDataUrl'))
      return
    }

    const success = await copyToClipboard(parsed.payload)
    pushToast({
      kind: success ? 'success' : 'error',
      message: t(success ? 'toast.copySuccess' : 'toast.copyError'),
    })
  }

  const handleDownload = () => {
    setError('')

    if (!parsed || !previewState) {
      setError(t('dataUrl.error.cannotDownload'))
      return
    }

    try {
      if (parsed.isBase64 && previewState.blob) {
        triggerDownload(previewState.blob, `data-url-payload.${previewState.extension}`)
        pushToast({ kind: 'success', message: t('toast.downloadSuccess') })
        return
      }

      const text = decodeDataUrlTextPayload(parsed.payload)
      const blob = new Blob([text], { type: previewState.mime || 'text/plain;charset=utf-8' })
      triggerDownload(blob, `data-url-text.${previewState.extension}`)
      pushToast({ kind: 'success', message: t('toast.downloadSuccess') })
    } catch {
      pushToast({ kind: 'error', message: t('toast.downloadError') })
    }
  }

  return (
    <section className="tool-panel">
      <div className="panel-head">
        <h2>{t('dataUrl.title')}</h2>
        <p>{t('dataUrl.subtitle')}</p>
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={8}
        placeholder={t('dataUrl.input.placeholder')}
      />

      {!parsed && input.trim() && <p className="message error" role="alert">{t('dataUrl.error.invalidFormat')}</p>}

      {parsed && (
        <div className="preview-card">
          <div className="meta-grid">
            <p><strong>{t('dataUrl.meta.mime')}</strong> {previewState?.mime ?? parsed.mime}</p>
            <p><strong>{t('dataUrl.meta.mediaType')}</strong> {parsed.mediaType}</p>
            <p><strong>{t('dataUrl.meta.encoding')}</strong> {parsed.isBase64 ? t('dataUrl.value.base64') : t('dataUrl.value.plain')}</p>
            <p><strong>{t('dataUrl.meta.payloadLength')}</strong> {parsed.payload.length}</p>
            <p>
              <strong>{t('dataUrl.meta.parameters')}</strong>{' '}
              {parsed.parameters.length
                ? parsed.parameters.map((parameter) => parameter.raw).join('; ')
                : t('dataUrl.value.none')}
            </p>
            <p><strong>{t('dataUrl.meta.preview')}</strong> {previewState?.previewKind ?? t('dataUrl.value.na')}</p>
            <p><strong>{t('dataUrl.meta.size')}</strong> {previewState?.sizeBytes != null ? bytesToSize(previewState.sizeBytes) : t('dataUrl.value.na')}</p>
          </div>

          <div className="button-row">
            <button onClick={handleCopyPayload}>{t('dataUrl.action.copyPayload')}</button>
            <button className="button-ghost" onClick={handleDownload}>{t('dataUrl.action.downloadPayload')}</button>
          </div>

          {previewState && (
            <DecodedPreview
              previewKind={previewState.previewKind}
              objectUrl={previewState.objectUrl}
              textPreview={previewState.textPreview}
            />
          )}
        </div>
      )}
    </section>
  )
}
