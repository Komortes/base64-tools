import type { PreviewKind } from '../utils/fileType'

interface DecodedPreviewProps {
  previewKind: PreviewKind
  objectUrl?: string
  textPreview?: string | null
}

export function DecodedPreview({ previewKind, objectUrl, textPreview }: DecodedPreviewProps) {
  if (previewKind === 'image' && objectUrl) {
    return <img src={objectUrl} alt="Decoded preview" className="image-preview" />
  }

  if (previewKind === 'pdf' && objectUrl) {
    return <iframe src={objectUrl} title="PDF preview" className="pdf-preview" />
  }

  if (previewKind === 'video' && objectUrl) {
    return <video src={objectUrl} controls className="media-preview" />
  }

  if (previewKind === 'audio' && objectUrl) {
    return <audio src={objectUrl} controls className="audio-preview" />
  }

  if (previewKind === 'text' && textPreview) {
    return <pre className="text-preview">{textPreview.slice(0, 5000)}</pre>
  }

  return <p className="hint-text">No browser preview for this type. Use download.</p>
}
