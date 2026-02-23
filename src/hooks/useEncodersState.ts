import { useMemo, useState } from 'react'
import {
  ENCODER_CONFIGS,
  type EncoderConfig,
  type EncoderKind,
  type FileInputMode,
} from '../configs/encoders'
import { blobToBase64, bytesToBase64 } from '../utils/base64'
import { bytesToSize, triggerDownload } from '../utils/blob'
import { encodeBytesToBase64InWorker } from '../utils/base64Worker'
import { copyToClipboard } from '../utils/clipboard'
import { hexToBytes } from '../utils/hex'
import { filenameFromUrl } from '../utils/urlFile'

const WORKER_THRESHOLD_BYTES = 512 * 1024

interface EncodersStateValues {
  kind: EncoderKind
  config: EncoderConfig
  textInput: string
  hexInput: string
  fileInputMode: FileInputMode
  selectedFile: File | null
  remoteFileUrl: string
  loadingRemoteFile: boolean
  isEncoding: boolean
  base64Output: string
  withDataUrlPrefix: boolean
  error: string
}

interface EncodersStateActions {
  setTextInput: (value: string) => void
  setHexInput: (value: string) => void
  setFileInputMode: (value: FileInputMode) => void
  setSelectedFile: (file: File | null) => void
  setRemoteFileUrl: (value: string) => void
  setBase64Output: (value: string) => void
  toggleWithDataUrlPrefix: () => void
  handleTypeChange: (nextType: EncoderKind) => void
  handleLoadFromUrl: () => Promise<void>
  handleEncode: () => Promise<void>
  copyBase64: () => Promise<boolean>
  downloadBase64: () => void
  clearAll: () => void
}

export interface UseEncodersStateResult extends EncodersStateValues, EncodersStateActions {}

export function useEncodersState(): UseEncodersStateResult {
  const [kind, setKind] = useState<EncoderKind>('text')
  const [textInput, setTextInputValue] = useState('')
  const [hexInput, setHexInputValue] = useState('')
  const [fileInputMode, setFileInputModeValue] = useState<FileInputMode>('local')
  const [selectedFile, setSelectedFileValue] = useState<File | null>(null)
  const [remoteFileUrl, setRemoteFileUrlValue] = useState('')
  const [loadingRemoteFile, setLoadingRemoteFile] = useState(false)
  const [isEncoding, setIsEncoding] = useState(false)
  const [base64Output, setBase64OutputValue] = useState('')
  const [withDataUrlPrefix, setWithDataUrlPrefix] = useState(false)
  const [error, setError] = useState('')

  const config = useMemo(
    () => ENCODER_CONFIGS.find((entry) => entry.kind === kind) ?? ENCODER_CONFIGS[0],
    [kind],
  )

  const resetMessages = () => {
    setError('')
  }

  const setTextInput = (value: string) => {
    setTextInputValue(value)
  }

  const setHexInput = (value: string) => {
    setHexInputValue(value)
  }

  const setFileInputMode = (value: FileInputMode) => {
    setFileInputModeValue(value)
  }

  const setSelectedFile = (file: File | null) => {
    setSelectedFileValue(file)
  }

  const setRemoteFileUrl = (value: string) => {
    setRemoteFileUrlValue(value)
  }

  const setBase64Output = (value: string) => {
    setBase64OutputValue(value)
  }

  const toggleWithDataUrlPrefix = () => {
    setWithDataUrlPrefix((prev) => !prev)
  }

  const handleTypeChange = (nextType: EncoderKind) => {
    setKind(nextType)
    setTextInputValue('')
    setHexInputValue('')
    setFileInputModeValue('local')
    setSelectedFileValue(null)
    setRemoteFileUrlValue('')
    setLoadingRemoteFile(false)
    setBase64OutputValue('')
    resetMessages()
  }

  const handleLoadFromUrl = async () => {
    resetMessages()

    if (!remoteFileUrl.trim()) {
      setError('Enter a file URL first.')
      return
    }

    if (config.mode !== 'file') {
      setError('URL loading is available only for file-based encoders.')
      return
    }

    setLoadingRemoteFile(true)

    try {
      const response = await fetch(remoteFileUrl.trim())
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`)
      }

      const blob = await response.blob()
      const fallbackName = `remote-${kind}`
      const guessedName = filenameFromUrl(remoteFileUrl.trim(), fallbackName, config.extension)
      const mime = blob.type || config.defaultMime
      const file = new File([blob], guessedName, { type: mime })
      setSelectedFileValue(file)
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : 'Failed to load file from URL.'
      setError(`Cannot load by URL. ${message} This can fail if CORS is blocked.`)
    } finally {
      setLoadingRemoteFile(false)
    }
  }

  const handleEncode = async () => {
    resetMessages()

    if (config.mode === 'file' && !selectedFile) {
      setError('Choose a file before encoding.')
      return
    }

    setIsEncoding(true)

    try {
      let mime = config.defaultMime
      let encoded = ''

      if (config.mode === 'file') {
        const fileToEncode = selectedFile
        if (!fileToEncode) {
          throw new Error('Choose a file before encoding.')
        }

        encoded = await blobToBase64(fileToEncode)
        if (fileToEncode.type) {
          mime = fileToEncode.type
        }
      } else if (config.mode === 'hex') {
        const bytes = hexToBytes(hexInput)
        encoded =
          bytes.length >= WORKER_THRESHOLD_BYTES
            ? await encodeBytesToBase64InWorker(bytes)
            : bytesToBase64(bytes)
      } else {
        const bytes = new TextEncoder().encode(textInput)
        encoded =
          bytes.length >= WORKER_THRESHOLD_BYTES
            ? await encodeBytesToBase64InWorker(bytes)
            : bytesToBase64(bytes)
      }

      const output = withDataUrlPrefix ? `data:${mime};base64,${encoded}` : encoded
      setBase64OutputValue(output)
    } catch (encodeError) {
      const message = encodeError instanceof Error ? encodeError.message : 'Encode failed.'
      setError(message)
    } finally {
      setIsEncoding(false)
    }
  }

  const copyBase64 = async () => copyToClipboard(base64Output)

  const downloadBase64 = () => {
    const blob = new Blob([base64Output], { type: 'text/plain;charset=utf-8' })
    triggerDownload(blob, `${kind}-base64.txt`)
  }

  const clearAll = () => {
    setTextInputValue('')
    setHexInputValue('')
    setSelectedFileValue(null)
    setRemoteFileUrlValue('')
    setBase64OutputValue('')
    resetMessages()
  }

  return {
    kind,
    config,
    textInput,
    hexInput,
    fileInputMode,
    selectedFile,
    remoteFileUrl,
    loadingRemoteFile,
    isEncoding,
    base64Output,
    withDataUrlPrefix,
    error,
    setTextInput,
    setHexInput,
    setFileInputMode,
    setSelectedFile,
    setRemoteFileUrl,
    setBase64Output,
    toggleWithDataUrlPrefix,
    handleTypeChange,
    handleLoadFromUrl,
    handleEncode,
    copyBase64,
    downloadBase64,
    clearAll,
  }
}

export function selectedFileLabel(file: File | null): string {
  if (!file) {
    return 'No file selected'
  }

  return `Selected: ${file.name} (${bytesToSize(file.size)})`
}
