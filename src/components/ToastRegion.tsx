import { useEffect } from 'react'
import { useI18n } from '../i18n/useI18n'
import { useToastStore, type ToastMessage } from '../store/toast'

interface ToastItemProps {
  toast: ToastMessage
  onDismiss: (id: string) => void
  dismissLabel: string
}

function ToastItem({ toast, onDismiss, dismissLabel }: ToastItemProps) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      onDismiss(toast.id)
    }, toast.durationMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [toast.durationMs, toast.id, onDismiss])

  return (
    <div
      className={`toast-item is-${toast.kind}`}
      role={toast.kind === 'error' ? 'alert' : 'status'}
      aria-live={toast.kind === 'error' ? 'assertive' : 'polite'}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        className="toast-close button-ghost"
        onClick={() => onDismiss(toast.id)}
        aria-label={dismissLabel}
      >
        ×
      </button>
    </div>
  )
}

export function ToastRegion() {
  const { t } = useI18n()
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  return (
    <div className="toast-region" aria-label={t('app.toastRegion')} role="region">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={dismissToast}
          dismissLabel={t('toast.dismiss')}
        />
      ))}
    </div>
  )
}
