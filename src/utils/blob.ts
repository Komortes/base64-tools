export function bytesToSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  const units = ['KB', 'MB', 'GB']
  let size = bytes / 1024
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex += 1
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()

  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

export async function tryTextPreview(blob: Blob): Promise<string | null> {
  if (!blob.type.startsWith('text/') && !/json|xml|javascript/.test(blob.type)) {
    return null
  }

  try {
    return await blob.text()
  } catch {
    return null
  }
}
