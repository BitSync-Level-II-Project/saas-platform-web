import { useSyncExternalStore } from 'react'

export interface Toast {
  id: number
  kind: 'success' | 'error' | 'info'
  text: string
  action?: { label: string; run: () => void }
}

let toasts: Toast[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id)
  emit()
}

/** Call from anywhere (event handlers, mutation callbacks). Toasts disappear after 6 seconds. */
export function showToast(kind: Toast['kind'], text: string, action?: Toast['action']) {
  const id = nextId++
  toasts = [...toasts, { id, kind, text, action }]
  emit()
  setTimeout(() => dismissToast(id), 6000)
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}
export const useToasts = (): Toast[] => useSyncExternalStore(subscribe, () => toasts)
