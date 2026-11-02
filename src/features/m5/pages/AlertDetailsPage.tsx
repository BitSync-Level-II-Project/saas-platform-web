import { useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAlert, useAlertAction, useLookups } from '../api/hooks'
import { SeverityBadge, StatusBadge } from '../components/Badges'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { ReasonDialog } from '../components/Dialogs'
import { showToast } from '../components/toast'
import { errorMessage } from '../lib/errors'
import { conditionText, getByPath } from '../lib/evaluate'
import { formatDateTime } from '../lib/format'
import { canActOnAlerts } from '../lib/permissions'
import { useSessionUser } from '../session'
import type { AlertDetails } from '../types'

const ACTION_LABEL: Record<string, string> = {
  CREATED: 'Alert raised', ACKNOWLEDGE: 'Acknowledged', ESCALATE: 'Escalated', RESOLVE: 'Resolved',
}
const SOURCE_LABEL: Record<string, string> = {
  FIELD_SUBMISSION: 'Field submission', STATIONED_TELEMETRY: 'Stationed phone', HEARTBEAT: 'Heartbeat',
}

/** Why a lifecycle button is unavailable (shown as a tooltip). undefined means it is available. */
function whyDisabled(a: AlertDetails, action: 'acknowledge' | 'resolve' | 'escalate', allowed: boolean): string | undefined {
  if (!allowed) return 'Your role cannot change alerts.'
  if (action === 'acknowledge' && a.status !== 'NEW') return 'Only new alerts can be acknowledged.'
  if (action === 'resolve' && a.status === 'RESOLVED') return 'This alert is already resolved.'
  if (action === 'escalate' && a.status === 'RESOLVED') return 'Resolved alerts cannot be escalated.'
  if (action === 'escalate' && a.status === 'ESCALATED') return 'This alert is already escalated. Resolve it once the issue is fixed.'
  return undefined
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (<section className="m5-card"><h2>{title}</h2>{children}</section>)
}

export function AlertDetailsPage() {
  const { id } = useParams()
  const alert = useAlert(id)
  const act = useAlertAction()
  const lookups = useLookups()
  const user = useSessionUser()
  const [dialog, setDialog] = useState<null | 'resolve' | 'escalate'>(null)

  if (alert.isPending) return <p className="m5-note" role="status">Loading alert…</p>
  if (alert.isError || !alert.data) {
    return (
      <EmptyState
        title="Alert not found" hint={alert.isError ? errorMessage(alert.error) : undefined}
        action={<Link to="/alerts" className="m5-btn">Back to alerts</Link>}
      />
    )
  }

  const a = alert.data
  const allowed = canActOnAlerts(user.role)
  const value = a.rule && a.event ? getByPath(a.event.payload, a.rule.fieldKey) : undefined

  const run = (action: 'acknowledge' | 'resolve' | 'escalate', note?: string) =>
    act.mutate({ id: a.id, action, note }, {
      onSuccess: () => {
        showToast('success', { acknowledge: 'Alert acknowledged', resolve: 'Alert resolved', escalate: 'Alert escalated' }[action])
        setDialog(null)
      },
      onError: (e) => { showToast('error', errorMessage(e)); setDialog(null) },
    })

  const button = (action: 'acknowledge' | 'resolve' | 'escalate', text: string, kind: string) => {
    const reason = whyDisabled(a, action, allowed)
    return (
      <span title={reason}>
        <button
          type="button" className={`m5-btn ${kind}`} disabled={!!reason || act.isPending}
          onClick={() => (action === 'acknowledge' ? run('acknowledge') : setDialog(action))}
        >
          {text}
        </button>
      </span>
    )
  }

  return (
    <>
      <PageHeader title={a.title} subtitle={a.message} crumb={{ label: 'Alerts', to: '/alerts' }} />
      <div className="m5-statusline">
        <SeverityBadge level={a.severity} />
        <StatusBadge status={a.status} />
        {a.escalationLevel > 0 && <span className="m5-sub">Escalation level {a.escalationLevel}</span>}
        <span className="m5-sub">Raised {formatDateTime(a.createdAt)}</span>
      </div>

      <div className="m5-formactions">
        {button('acknowledge', 'Acknowledge', 'primary')}
        {button('resolve', 'Resolve', '')}
        {button('escalate', 'Escalate', 'danger-ghost')}
      </div>

      <div className="m5-grid">
        <Section title="What triggered it">
          <dl className="m5-dl">
            <dt>Field</dt><dd>{a.rule?.fieldKey ?? '—'}</dd>
            <dt>Reading</dt><dd><strong>{value === undefined ? '—' : String(value)}</strong></dd>
            <dt>Condition</dt><dd>{a.rule ? <code className="m5-code">{conditionText(a.rule)}</code> : '—'}</dd>
            <dt>Source</dt><dd>{a.event ? SOURCE_LABEL[a.event.sourceType] : '—'}</dd>
            <dt>Reading taken</dt><dd>{a.event ? formatDateTime(a.event.occurredAt) : '—'}</dd>
            <dt>Event</dt><dd><code className="m5-code">{a.eventId}</code></dd>
          </dl>
        </Section>

        <Section title="Where and which rule">
          <dl className="m5-dl">
            <dt>Warehouse</dt><dd>{lookups.site(a.siteId)}</dd>
            <dt>Location</dt><dd>{lookups.location(a.locationId)}</dd>
            <dt>Device</dt><dd>{lookups.device(a.deviceId)}</dd>
            <dt>Rule</dt>
            <dd>{a.rule ? <Link to={`/rules/${a.rule.id}`}>{a.rule.name}</Link> : 'Rule no longer available'}</dd>
          </dl>
        </Section>

        <Section title="Timeline">
          <ol className="m5-timeline">
            {a.actions.map((t) => (
              <li key={t.id}>
                <strong>{ACTION_LABEL[t.action] ?? t.action}</strong> · {t.actorName}
                <small className="m5-sub">{formatDateTime(t.createdAt)}</small>
                {t.note && <p>{t.note}</p>}
              </li>
            ))}
          </ol>
        </Section>
      </div>

      {dialog && (
        <ReasonDialog
          title={dialog === 'resolve' ? 'Resolve alert' : 'Escalate alert'}
          label={dialog === 'resolve' ? 'What was done to fix it?' : 'Why does this need escalation?'}
          confirmLabel={dialog === 'resolve' ? 'Resolve alert' : 'Escalate alert'}
          busy={act.isPending} onCancel={() => setDialog(null)} onConfirm={(note) => run(dialog, note)}
        />
      )}
    </>
  )
}
