import type { Severity } from '../types'

export const SEVERITIES: Severity[] = ['INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

/** All times in the app are shown in this zone (the audit log footer says so). */
export const APP_TZ = 'Asia/Colombo'

export const formatDateTime = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: APP_TZ })

const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: APP_TZ }).format(d)
const hourMinute = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: APP_TZ, hour: '2-digit', minute: '2-digit', hour12: false }).format(d)

/** "Today, 09:24", "Yesterday, 16:40" or "27 Oct, 09:24". */
export function formatWhen(iso: string, now: number): string {
  const d = new Date(iso)
  const key = dayKey(d)
  if (key === dayKey(new Date(now))) return `Today, ${hourMinute(d)}`
  if (key === dayKey(new Date(now - 86_400_000))) return `Yesterday, ${hourMinute(d)}`
  const day = new Intl.DateTimeFormat('en-GB', { timeZone: APP_TZ, day: 'numeric', month: 'short' }).format(d)
  return `${day}, ${hourMinute(d)}`
}

/** "27 Oct 2026, 09:24" */
export const formatFull = (iso: string): string =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: APP_TZ, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date(iso))

export const initials = (name: string): string =>
  name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase()

export const roleLabel = (role: string): string => role.charAt(0) + role.slice(1).toLowerCase()

/** Relative time. `now` is passed in so components stay pure (see useNow). */
export function timeAgo(from: string | number, now: number): string {
  const diff = Math.max(0, now - (typeof from === 'number' ? from : Date.parse(from)))
  const min = Math.floor(diff / 60_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} h ago`
  return `${Math.floor(h / 24)} d ago`
}

/** Fields that differ between two snapshots, for the audit history and rule History tab. */
export function changedKeys(before: unknown, after: unknown): string[] {
  if (typeof before !== 'object' || typeof after !== 'object' || !before || !after) return []
  const b = before as Record<string, unknown>
  const a = after as Record<string, unknown>
  return [...new Set([...Object.keys(b), ...Object.keys(a)])].filter(
    (k) => k !== 'updatedAt' && JSON.stringify(b[k]) !== JSON.stringify(a[k]),
  )
}
