import type { PreviewKind } from '../utils/fileType'
import { useI18n } from '../i18n/useI18n'

interface DecodedPreviewProps {
  previewKind: PreviewKind
  objectUrl?: string
  textPreview?: string | null
}

export function DecodedPreview({ previewKind, objectUrl, textPreview }: DecodedPreviewProps) {
  const { t } = useI18n()

  if (previewKind === 'image' && objectUrl) {
    return <img src={objectUrl} alt={t('preview.alt.decoded')} className="image-preview" />
  }

  if (previewKind === 'pdf' && objectUrl) {
    return <iframe src={objectUrl} title={t('preview.title.pdf')} className="pdf-preview" />
  }

  if (previewKind === 'video' && objectUrl) {
    return <video src={objectUrl} controls className="media-preview" />
  }

  if (previewKind === 'audio' && objectUrl) {
    return <audio src={objectUrl} controls className="audio-preview" />
  }

  if (previewKind === 'text' && textPreview !== null) {
    return <pre className="text-preview">{textPreview.slice(0, 5000)}</pre>
  }

  return <p className="hint-text">{t('preview.none')}</p>
}
