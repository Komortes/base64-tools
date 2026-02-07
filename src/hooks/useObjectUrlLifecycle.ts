import { useCallback, useEffect, useRef } from 'react'

export function useObjectUrlLifecycle() {
  const objectUrlRef = useRef<string | null>(null)

  const revokeObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const setObjectUrl = useCallback((nextObjectUrl: string | null) => {
    if (objectUrlRef.current && objectUrlRef.current !== nextObjectUrl) {
      URL.revokeObjectURL(objectUrlRef.current)
    }

    objectUrlRef.current = nextObjectUrl
  }, [])

  useEffect(() => {
    return () => {
      revokeObjectUrl()
    }
  }, [revokeObjectUrl])

  return {
    objectUrlRef,
    setObjectUrl,
    revokeObjectUrl,
  }
}
