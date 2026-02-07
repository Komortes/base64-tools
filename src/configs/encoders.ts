export type EncoderKind =
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

export interface EncoderConfig {
  kind: EncoderKind
  label: string
  mode: 'file' | 'text' | 'hex'
  accept?: string
  defaultMime: string
  placeholder: string
  extension: string
}

export type FileInputMode = 'local' | 'url'

export const ENCODER_CONFIGS: EncoderConfig[] = [
  {
    kind: 'audio',
    label: 'Audio to Base64',
    mode: 'file',
    accept: 'audio/*,.mp3,.wav,.ogg,.m4a,.flac',
    defaultMime: 'audio/mpeg',
    placeholder: 'Upload audio file or load by URL.',
    extension: 'mp3',
  },
  {
    kind: 'css',
    label: 'CSS to Base64',
    mode: 'text',
    defaultMime: 'text/css;charset=utf-8',
    placeholder: 'Paste CSS code.',
    extension: 'css',
  },
  {
    kind: 'file',
    label: 'File to Base64',
    mode: 'file',
    accept: '*/*',
    defaultMime: 'application/octet-stream',
    placeholder: 'Upload any file or load by URL.',
    extension: 'bin',
  },
  {
    kind: 'hex',
    label: 'Hex to Base64',
    mode: 'hex',
    defaultMime: 'application/octet-stream',
    placeholder: 'Paste hex string, e.g. 48 65 6c 6c 6f',
    extension: 'hex',
  },
  {
    kind: 'html',
    label: 'HTML to Base64',
    mode: 'text',
    defaultMime: 'text/html;charset=utf-8',
    placeholder: 'Paste HTML markup.',
    extension: 'html',
  },
  {
    kind: 'image',
    label: 'Image to Base64',
    mode: 'file',
    accept: 'image/*,.png,.jpg,.jpeg,.gif,.webp,.svg',
    defaultMime: 'image/png',
    placeholder: 'Upload image file or load by URL.',
    extension: 'png',
  },
  {
    kind: 'pdf',
    label: 'PDF to Base64',
    mode: 'file',
    accept: '.pdf,application/pdf',
    defaultMime: 'application/pdf',
    placeholder: 'Upload PDF file or load by URL.',
    extension: 'pdf',
  },
  {
    kind: 'text',
    label: 'Text to Base64',
    mode: 'text',
    defaultMime: 'text/plain;charset=utf-8',
    placeholder: 'Paste plain text.',
    extension: 'txt',
  },
  {
    kind: 'url',
    label: 'URL to Base64',
    mode: 'text',
    defaultMime: 'text/plain;charset=utf-8',
    placeholder: 'Paste URL, e.g. https://example.com/path?q=1',
    extension: 'txt',
  },
  {
    kind: 'video',
    label: 'Video to Base64',
    mode: 'file',
    accept: 'video/*,.mp4,.webm,.mov,.mkv',
    defaultMime: 'video/mp4',
    placeholder: 'Upload video file or load by URL.',
    extension: 'mp4',
  },
]
