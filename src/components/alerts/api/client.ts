import { ApiError } from '../lib/errors'

/** Mock mode is ON unless VITE_USE_MOCK=false. Set it to false once the backend exists. */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'

const BASE: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1'

/** Builds ?a=1&b=2, skipping empty values. */
export function qs(params: object): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') p.set(k, String(v))
  const s = p.toString()
  return s ? `?${s}` : ''
}

/** Used only when USE_MOCK is false. */
export async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = (await res.json().catch(() => null)) as { message?: string } | null
    throw new ApiError(res.status, detail?.message ?? `Request failed (${res.status}).`)
  }
  return (await res.json()) as T
}
