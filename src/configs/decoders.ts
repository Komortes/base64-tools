import type { PreviewKind } from '../utils/fileType'

export type DecoderKind =
  | 'auto'
  | 'audio'
  | 'css'
  | 'file'
  | 'hex'
  | 'html'
  | 'image'
  | 'pdf'
  | 'text'
  | 'url'
  | 'video'

export interface DecoderConfig {
  kind: DecoderKind
  label: string
  mode: 'auto' | 'detected' | 'binary' | 'text' | 'hex'
  expectedPreview?: PreviewKind
  defaultMime: string
  extension: string
  description: string
}

export const DECODER_CONFIGS: DecoderConfig[] = [
  {
    kind: 'auto',
    label: 'Auto Decode',
    mode: 'auto',
    defaultMime: 'application/octet-stream',
    extension: 'bin',
    description: 'Automatically detects payload type and best preview.',
  },
  {
    kind: 'image',
    label: 'Image Decoder',
    mode: 'binary',
    expectedPreview: 'image',
    defaultMime: 'image/png',
    extension: 'png',
    description: 'Decode to image. If unknown, force image output.',
  },
  {
    kind: 'file',
    label: 'File Decoder',
    mode: 'detected',
    defaultMime: 'application/octet-stream',
    extension: 'bin',
    description: 'Decode any payload as file with detected MIME.',
  },
  {
    kind: 'pdf',
    label: 'PDF Decoder',
    mode: 'binary',
    expectedPreview: 'pdf',
    defaultMime: 'application/pdf',
    extension: 'pdf',
    description: 'Decode to PDF with embedded preview.',
  },
  {
    kind: 'audio',
    label: 'Audio Decoder',
    mode: 'binary',
    expectedPreview: 'audio',
    defaultMime: 'audio/mpeg',
    extension: 'mp3',
    description: 'Decode to audio file and listen in browser.',
  },
  {
    kind: 'video',
    label: 'Video Decoder',
    mode: 'binary',
    expectedPreview: 'video',
    defaultMime: 'video/mp4',
    extension: 'mp4',
    description: 'Decode to video file and preview in browser.',
  },
  {
    kind: 'text',
    label: 'Text Decoder',
    mode: 'text',
    defaultMime: 'text/plain;charset=utf-8',
    extension: 'txt',
    description: 'Decode UTF-8 text from Base64 or data URL.',
  },
  {
    kind: 'html',
    label: 'HTML Decoder',
    mode: 'text',
    defaultMime: 'text/html;charset=utf-8',
    extension: 'html',
    description: 'Decode HTML source.',
  },
  {
    kind: 'css',
    label: 'CSS Decoder',
    mode: 'text',
    defaultMime: 'text/css;charset=utf-8',
    extension: 'css',
    description: 'Decode CSS text source.',
  },
  {
    kind: 'url',
    label: 'URL Decoder',
    mode: 'text',
    defaultMime: 'text/plain;charset=utf-8',
    extension: 'txt',
    description: 'Decode and inspect URL value.',
  },
  {
    kind: 'hex',
    label: 'Hex Decoder',
    mode: 'hex',
    defaultMime: 'text/plain;charset=utf-8',
    extension: 'txt',
    description: 'Decode bytes and show hexadecimal representation.',
  },
]
