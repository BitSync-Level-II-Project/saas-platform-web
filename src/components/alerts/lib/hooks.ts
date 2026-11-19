import { useEffect, useState } from 'react'

/** Current time that ticks, so components can show "5 min ago" without calling Date.now() in render. */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(t)
  }, [intervalMs])
  return now
}

/** Delays a fast-changing value (like a search box) before it triggers a query. */
export function useDebounced<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(t)
  }, [value, delayMs])
  return debounced
}

/** crypto.randomUUID only exists on secure origins (https or localhost), so keep a fallback for LAN testing. */
export const uuid = (): string =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
