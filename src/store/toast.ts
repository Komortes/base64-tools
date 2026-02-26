import { create } from 'zustand'

export type ToastKind = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  kind: ToastKind
  message: string
  durationMs: number
}

interface PushToastInput {
  kind: ToastKind
  message: string
  durationMs?: number
}

interface ToastState {
  toasts: ToastMessage[]
  pushToast: (input: PushToastInput) => void
  dismissToast: (id: string) => void
  clearToasts: () => void
}

function toastId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  pushToast: ({ kind, message, durationMs = 2800 }) => {
    const nextToast: ToastMessage = {
      id: toastId(),
      kind,
      message,
      durationMs,
    }

    set((state) => ({
      toasts: [...state.toasts, nextToast],
    }))
  },
  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  clearToasts: () => {
    set({ toasts: [] })
  },
}))
