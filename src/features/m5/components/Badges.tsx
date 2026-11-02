import type { AlertStatus, NotifStatus, Severity } from '../types'

// Icon plus text plus colour, never colour alone.
const SEVERITY_ICON: Record<Severity, string> = { INFO: 'i', LOW: '✓', MEDIUM: '!', HIGH: '!!', CRITICAL: '✕' }
const STATUS_ICON: Record<AlertStatus | NotifStatus, string> = {
  NEW: '●', ACKNOWLEDGED: '◐', RESOLVED: '✓', ESCALATED: '▲',
  PENDING: '…', SENT: '→', DELIVERED: '✓', FAILED: '✕',
}

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()

export function SeverityBadge({ level }: { level: Severity }) {
  return (
    <span className={`m5-badge sev-${level.toLowerCase()}`}>
      <b aria-hidden="true">{SEVERITY_ICON[level]}</b>
      {sentence(level)}
    </span>
  )
}

export function StatusBadge({ status }: { status: AlertStatus | NotifStatus }) {
  return (
    <span className={`m5-badge st-${status.toLowerCase()}`}>
      <b aria-hidden="true">{STATUS_ICON[status]}</b>
      {sentence(status)}
    </span>
  )
}

/** "Active" or "Paused" pill for a rule, as in the Figma rules table. */
export function RuleStatusBadge({ enabled }: { enabled: boolean }) {
  return (
    <span className={`m5-badge ${enabled ? 'st-active' : 'st-paused'}`}>
      <b aria-hidden="true">{enabled ? '●' : '❚❚'}</b>
      {enabled ? 'Active' : 'Paused'}
    </span>
  )
}
