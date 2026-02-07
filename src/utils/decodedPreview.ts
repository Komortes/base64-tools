import { tryTextPreview } from './blob'
import { detectFileType, type FileTypeResult } from './fileType'

export interface BinaryPreviewResult {
  detected: FileTypeResult
  blob: Blob
  textPreview: string | null
}

export async function buildBinaryPreview(
  bytes: Uint8Array,
  hintedMime?: string,
  mimeOverride?: string,
  detectedType?: FileTypeResult,
): Promise<BinaryPreviewResult> {
  const detected = detectedType ?? detectFileType(bytes, hintedMime, mimeOverride)
  const blob = new Blob([new Uint8Array(bytes)], { type: detected.mime })
  const textPreview = detected.previewKind === 'text' ? await tryTextPreview(blob) : null

  return {
    detected,
    blob,
    textPreview,
  }
}
