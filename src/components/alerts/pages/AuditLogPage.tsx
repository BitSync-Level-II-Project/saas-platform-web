import { useState } from 'react'
import { useAuditLogs } from '../api/hooks'
import { DataTable, Pager, type Column } from '../parts/DataTable'
import { EmptyState } from '../parts/EmptyState'
import { Field } from '../parts/Field'
import { PageHeader } from '../parts/PageHeader'
import { errorMessage } from '../lib/errors'
import { APP_TZ, changedKeys, formatFull, formatWhen, roleLabel } from '../lib/format'
import { useDebounced, useNow } from '../lib/hooks'
import { ACTION_LABEL, actionLabel } from '../lib/labels'
import { canViewAudit } from '../lib/permissions'
import type { Nav } from '../navigation'
import { useSessionUser } from '../session'
import type { AuditLog } from '../types'

const PAGE_SIZE = 8
const RANGES = [
  { key: '24h', label: 'Last 24 hours', hours: 24 },
  { key: '7d', label: 'Last 7 days', hours: 24 * 7 },
  { key: '30d', label: 'Last 30 days', hours: 24 * 30 },
] as const

const SHOWN = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v))

/** Name of the record an entry is about, plus where to open it when it is an alert or a rule. */
function related(a: AuditLog): { text: string; open?: 'alert' | 'rule' } {
  const snap = (a.after ?? a.before) as Record<string, unknown> | undefined
  const text = (typeof snap?.record === 'string' && snap.record) || (typeof snap?.name === 'string' && snap.name) ||
    (typeof snap?.title === 'string' && snap.title) || `${a.resourceType} · ${a.resourceId}`
  if (a.resourceType === 'AutomationRule') return { text, open: 'rule' }
  if (a.resourceType === 'Alert') return { text, open: 'alert' }
  return { text }
}

function summary(a: AuditLog): string {
  const snap = a.after as Record<string, unknown> | undefined
  if (typeof snap?.summary === 'string') return snap.summary
  const changed = changedKeys(a.before, a.after)
  if (changed.length > 0) return `Changed ${changed.join(', ')}.`
  if (typeof snap?.message === 'string') return snap.message
  return a.outcome === 'FAILURE' ? 'The action failed.' : 'No extra details were recorded.'
}

export function AuditLogPage({ nav }: { nav: Nav }) {
  const user = useSessionUser()
  const now = useNow(60_000)
  const [search, setSearch] = useState('')
  const [action, setAction] = useState('')
  const [range, setRange] = useState<(typeof RANGES)[number]['key']>('7d')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const debouncedSearch = useDebounced(search)

  // Rounded to the hour so the query key stays stable between refreshes.
  const hours = RANGES.find((r) => r.key === range)?.hours ?? 168
  const from = new Date(Math.floor((now - hours * 3_600_000) / 3_600_000) * 3_600_000).toISOString()

  const audit = useAuditLogs({ search: debouncedSearch, action, from, page, pageSize: PAGE_SIZE }, canViewAudit(user.role))

  if (!canViewAudit(user.role)) {
    return (
      <div className="page">
        <PageHeader title="Audit log" />
        <EmptyState title="Your role cannot open the audit log" hint="Ask a manager or admin if you need to see a change history." />
      </div>
    )
  }

  const items = audit.data?.items
  const selected = items?.find((a) => a.id === selectedId) ?? items?.[0]
  const changed = selected ? changedKeys(selected.before, selected.after) : []
  const rel = selected ? related(selected) : undefined

  const columns: Column<AuditLog>[] = [
    { key: 'time', header: 'Time', render: (a) => formatWhen(a.createdAt, now) },
    { key: 'person', header: 'Person', render: (a) => a.actorName },
    { key: 'action', header: 'Action', render: (a) => <strong>{actionLabel(a.action)}</strong> },
    { key: 'ref', header: 'Reference', render: (a) => <span className={related(a).open ? 'al-reflink' : undefined}>{a.resourceId}</span> },
  ]

  return (
    <div className="page">
      <PageHeader
        crumb={{ label: 'Audit log', onClick: nav.openAudit }}
        title="Audit log"
        subtitle="Read-only history of changes in your permitted workspace."
      />

      <div className="al-auditfilters">
        <Field label="Search">
          {(p) => (
            <input
              {...p} className="input" type="search" placeholder="Search person, action or reference" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          )}
        </Field>
        <Field label="Action">
          {(p) => (
            <select {...p} className="input" value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }}>
              <option value="">All actions</option>
              {Object.entries(ACTION_LABEL).map(([code, text]) => <option key={code} value={code}>{text}</option>)}
            </select>
          )}
        </Field>
        <Field label="Date range">
          {(p) => (
            <select {...p} className="input" value={range} onChange={(e) => { setRange(e.target.value as typeof range); setPage(1) }}>
              {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          )}
        </Field>
      </div>

      <div className="al-auditgrid">
        <DataTable
          columns={columns} rows={items} rowKey={(a) => a.id}
          loading={audit.isPending} error={audit.isError ? errorMessage(audit.error) : null} onRetry={() => audit.refetch()}
          onRowClick={(a) => setSelectedId(a.id)} skeletonRows={PAGE_SIZE}
          rowClassName={(a) => (a.id === selected?.id ? 'al-selected' : '')}
          empty={<EmptyState title="No events match" hint="Try another search, action or date range." />}
          footer={
            audit.data && (
              <>
                <Pager page={audit.data.page} pageSize={audit.data.pageSize} total={audit.data.total} onPage={setPage} noun="event" />
                <p className="al-tablenote">Times shown in {APP_TZ}</p>
              </>
            )
          }
        />

        <aside className="card al-pad al-details" aria-label="Event details">
          <div className="al-details-head">
            <h2 className="al-card-title">Event details</h2>
            <span className="pill st-new">Read-only</span>
          </div>
          {selected ? (
            <dl>
              <dt>Event</dt><dd><strong>{selected.id}</strong></dd>
              <dt>Action</dt><dd><strong>{actionLabel(selected.action)}</strong></dd>
              <dt>Person</dt><dd><strong>{selected.actorName}{selected.actorRole !== 'SYSTEM' && ` · ${roleLabel(selected.actorRole)}`}</strong></dd>
              <dt>Occurred</dt><dd><strong>{formatFull(selected.createdAt)}</strong></dd>
              <dt>Related record</dt>
              <dd>
                <strong>
                  {rel?.open ? (
                    <button
                      type="button" className="link-btn"
                      onClick={() => (rel.open === 'rule' ? nav.openRule(selected.resourceId) : nav.openAlert(selected.resourceId))}
                    >
                      {rel.text}
                    </button>
                  ) : rel?.text}
                </strong>
              </dd>
              <dt>Details</dt><dd><strong>{summary(selected)}</strong></dd>
              {changed.length > 0 && (
                <>
                  <dt>Changes</dt>
                  <dd>
                    <ul className="al-changes">
                      {changed.map((k) => (
                        <li key={k}>
                          <code className="al-code">{k}</code>{' '}
                          <span className="al-before">{SHOWN((selected.before as Record<string, unknown>)[k])}</span>
                          {' → '}
                          <span className="al-after">{SHOWN((selected.after as Record<string, unknown>)[k])}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          ) : (
            <p className="al-sub">Select an event to see its details.</p>
          )}
        </aside>
      </div>
    </div>
  )
}
