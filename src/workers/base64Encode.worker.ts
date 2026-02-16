import { bytesToBase64 } from '../utils/base64'

interface Base64EncodeRequest {
  buffer: ArrayBuffer
}

interface Base64EncodeSuccessResponse {
  ok: true
  base64: string
}

interface Base64EncodeErrorResponse {
  ok: false
  error: string
}

self.onmessage = (event: MessageEvent<Base64EncodeRequest>) => {
  try {
    const bytes = new Uint8Array(event.data.buffer)
    const base64 = bytesToBase64(bytes)
    const response: Base64EncodeSuccessResponse = { ok: true, base64 }
    self.postMessage(response)
  } catch (error) {
    const response: Base64EncodeErrorResponse = {
      ok: false,
      error: error instanceof Error ? error.message : 'Worker failed to encode Base64.',
    }
    self.postMessage(response)
  }
}
