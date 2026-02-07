import type { DecoderConfig, DecoderKind } from '../configs/decoders'
import type { PreviewKind } from './fileType'

export function kindFromPreview(previewKind: PreviewKind): DecoderKind {
  if (previewKind === 'image') return 'image'
  if (previewKind === 'pdf') return 'pdf'
  if (previewKind === 'audio') return 'audio'
  if (previewKind === 'video') return 'video'
  if (previewKind === 'text') return 'text'
  return 'file'
}

export function expectedPreviewForConfig(config: DecoderConfig): PreviewKind | null {
  if (config.mode === 'binary' && config.expectedPreview) {
    return config.expectedPreview
  }

  if (config.mode === 'text') {
    return 'text'
  }

  return null
}
