export function filenameFromUrl(input: string, fallbackBase: string, fallbackExt: string): string {
  try {
    const url = new URL(input)
    const pathPart = url.pathname.split('/').filter(Boolean).pop()
    if (pathPart && pathPart.includes('.')) {
      return decodeURIComponent(pathPart)
    }

    if (pathPart) {
      return `${decodeURIComponent(pathPart)}.${fallbackExt}`
    }
  } catch {
    // Ignore malformed URL and use fallback.
  }

  return `${fallbackBase}.${fallbackExt}`
}
