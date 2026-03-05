import { bytesToBase64 } from './base64'

interface Base64EncodeSuccessResponse {
  ok: true
  base64: string
}

interface Base64EncodeErrorResponse {
  ok: false
  error: string
}

type Base64EncodeResponse = Base64EncodeSuccessResponse | Base64EncodeErrorResponse

const WORKER_TIMEOUT_MS = 2 * 60 * 1000

export async function encodeBytesToBase64InWorker(bytes: Uint8Array): Promise<string> {
  if (typeof Worker === 'undefined') {
    return bytesToBase64(bytes)
  }

  return new Promise<string>((resolve, reject) => {
    const worker = new Worker(new URL('../workers/base64Encode.worker.ts', import.meta.url), {
      type: 'module',
    })

    let settled = false
    const timeoutId = globalThis.setTimeout(() => {
      if (settled) {
        return
      }

      settled = true
      worker.terminate()
      reject(new Error('Base64 worker timed out.'))
    }, WORKER_TIMEOUT_MS)

    worker.onmessage = (event: MessageEvent<Base64EncodeResponse>) => {
      if (settled) {
        return
      }

      settled = true
      globalThis.clearTimeout(timeoutId)
      worker.terminate()

      if (event.data.ok) {
        resolve(event.data.base64)
        return
      }

      reject(new Error(event.data.error))
    }

    worker.onerror = (event) => {
      if (settled) {
        return
      }

      settled = true
      globalThis.clearTimeout(timeoutId)
      worker.terminate()
      reject(new Error(event.message || 'Base64 worker crashed.'))
    }

    const copy = bytes.slice()
    worker.postMessage({ buffer: copy.buffer }, [copy.buffer])
  })
}
