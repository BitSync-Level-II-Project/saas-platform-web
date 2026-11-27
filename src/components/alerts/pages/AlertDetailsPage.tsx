import { useState, type ReactNode } from 'react'
import { useAlert, useAlertAction, useLookups } from '../api/hooks'
import { SeverityBadge, StatusBadge } from '../parts/Badges'
import { EmptyState } from '../parts/EmptyState'
import { PageHeader } from '../parts/PageHeader'
import { ReasonDialog } from '../parts/Dialogs'
import { showToast } from '../parts/toast'
import { errorMessage } from '../lib/errors'
import { conditionText, getByPath } from '../lib/evaluate'
import { formatDateTime } from '../lib/format'
import { canActOnAlerts } from '../lib/permissions'
import type { Nav } from '../navigation'
import { useSessionUser } from '../session'
import type { AlertDetails } from '../types'

const ACTION_LABEL: Record<string, string> = {
  CREATED: 'Alert raised', ACKNOWLEDGE: 'Acknowledged', ESCALATE: 'Escalated', RESOLVE: 'Resolved',
}
const SOURCE_LABEL: Record<string, string> = {
  FIELD_SUBMISSION: 'Field submission', STATIONED_TELEMETRY: 'Stationed phone', HEARTBEAT: 'Heartbeat',
}

type Act = 'acknowledge' | 'resolve' | 'escalate'

/** Why a lifecycle button is unavailable (shown as a tooltip). undefined means it is available. */
function whyDisabled(a: AlertDetails, action: Act, allowed: boolean): string | undefined {
  if (!allowed) return 'Your role cannot change alerts.'
  if (action === 'acknowledge' && a.status !== 'NEW') return 'Only new alerts can be acknowledged.'
  if (action === 'resolve' && a.status === 'RESOLVED') return 'This alert is already resolved.'
  if (action === 'escalate' && a.status === 'RESOLVED') return 'Resolved alerts cannot be escalated.'
  if (action === 'escalate' && a.status === 'ESCALATED') return 'This alert is already escalated. Resolve it once the issue is fixed.'
  return undefined
}

function Section({ title, children, wide }: { title: string; children: ReactNode; wide?: boolean }) {
  return (<section className={`card al-pad${wide ? ' al-wide' : ''}`}><h2 className="al-card-title">{title}</h2>{children}</section>)
}

export function AlertDetailsPage({ id, nav }: { id: string; nav: Nav }) {
  const alert = useAlert(id)
  const act = useAlertAction()
  const lookups = useLookups()
  const user = useSessionUser()
  const [dialog, setDialog] = useState<null | 'resolve' | 'escalate'>(null)
  const back = { label: 'Back to alerts', onClick: () => nav.openAlerts() }

  if (alert.isPending) return <div className="page"><p className="al-note" role="status">Loading alert…</p></div>
  if (alert.isError || !alert.data) {
    return (
      <div className="page">
        <PageHeader title="Alert not found" back={back} />
        <EmptyState title="We could not open this alert" hint={alert.isError ? errorMessage(alert.error) : undefined} />
      </div>
    )
  }

  const a = alert.data
  const allowed = canActOnAlerts(user.role)
  const value = a.rule && a.event ? getByPath(a.event.payload, a.rule.fieldKey) : undefined

  const run = (action: Act, note?: string) =>
    act.mutate({ id: a.id, action, note }, {
      onSuccess: () => {
        showToast('success', { acknowledge: 'Alert acknowledged', resolve: 'Alert resolved', escalate: 'Alert escalated' }[action])
        setDialog(null)
      },
      onError: (e) => { showToast('error', errorMessage(e)); setDialog(null) },
    })

  const button = (action: Act, text: string, kind: string) => {
    const reason = whyDisabled(a, action, allowed)
    return (
      <span title={reason}>
        <button
          type="button" className={kind} disabled={!!reason || act.isPending}
          onClick={() => (action === 'acknowledge' ? run('acknowledge') : setDialog(action))}
        >
          {text}
        </button>
      </span>
    )
  }

  return (
    <div className="page">
      <PageHeader title={a.title} subtitle={a.message} back={back} />
      <div className="al-statusline">
        <SeverityBadge level={a.severity} />
        <StatusBadge status={a.status} />
        {a.escalationLevel > 0 && <span className="al-sub">Escalation level {a.escalationLevel}</span>}
        <span className="al-sub">Raised {formatDateTime(a.createdAt)}</span>
      </div>

      <div className="al-buttons">
        {button('acknowledge', 'Acknowledge', 'primary-btn')}
        {button('resolve', 'Resolve', 'secondary-btn')}
        {button('escalate', 'Escalate', 'danger-btn')}
      </div>

      <div className="al-grid">
        <Section title="What triggered it">
          <dl className="al-dl">
            <dt>Field</dt><dd>{a.rule?.fieldKey ?? '—'}</dd>
            <dt>Reading</dt><dd><strong>{value === undefined ? '—' : String(value)}</strong></dd>
            <dt>Condition</dt><dd>{a.rule ? <code className="al-code">{conditionText(a.rule)}</code> : '—'}</dd>
            <dt>Source</dt><dd>{a.event ? SOURCE_LABEL[a.event.sourceType] : '—'}</dd>
            <dt>Reading taken</dt><dd>{a.event ? formatDateTime(a.event.occurredAt) : '—'}</dd>
            <dt>Event</dt><dd><code className="al-code">{a.eventId}</code></dd>
          </dl>
        </Section>

        <Section title="Where and which rule">
          <dl className="al-dl">
            <dt>Warehouse</dt><dd>{lookups.site(a.siteId)}</dd>
            <dt>Location</dt><dd>{lookups.location(a.locationId)}</dd>
            <dt>Device</dt><dd>{lookups.device(a.deviceId)}</dd>
            <dt>Rule</dt>
            <dd>
              {a.rule
                ? <button type="button" className="link-btn" onClick={() => nav.openRule(a.rule?.id)}>{a.rule.name}</button>
                : 'Rule no longer available'}
            </dd>
          </dl>
        </Section>

        <Section title="Timeline" wide>
          <ol className="al-timeline">
            {a.actions.map((t) => (
              <li key={t.id}>
                <strong>{ACTION_LABEL[t.action] ?? t.action}</strong> · {t.actorName}
                <div className="al-sub">{formatDateTime(t.createdAt)}</div>
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
    </div>
  )
}
