import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuditLogs } from '../api/hooks'
import { DataTable, Pager, type Column } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { errorMessage } from '../lib/errors'
import { APP_TZ, changedKeys, formatFull, formatWhen, roleLabel } from '../lib/format'
import { useDebounced, useNow } from '../lib/hooks'
import { ACTION_LABEL, actionLabel } from '../lib/labels'
import { canViewAudit } from '../lib/permissions'
import { useSessionUser } from '../session'
import type { AuditLog } from '../types'

const PAGE_SIZE = 8
const RANGES = [
  { key: '24h', label: 'Last 24 hours', hours: 24 },
  { key: '7d', label: 'Last 7 days', hours: 24 * 7 },
  { key: '30d', label: 'Last 30 days', hours: 24 * 30 },
] as const

const SHOWN = (v: unknown) => (v === undefined || v === null || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v))

/** Name of the record an entry is about, plus a link when it is one of ours. */
function related(a: AuditLog): { text: string; to?: string } {
  const snap = (a.after ?? a.before) as Record<string, unknown> | undefined
  const text = (typeof snap?.record === 'string' && snap.record) || (typeof snap?.name === 'string' && snap.name) ||
    (typeof snap?.title === 'string' && snap.title) || `${a.resourceType} · ${a.resourceId}`
  if (a.resourceType === 'AutomationRule') return { text, to: `/rules/${a.resourceId}` }
  if (a.resourceType === 'Alert') return { text, to: `/alerts/${a.resourceId}` }
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

export function AuditLogPage() {
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
      <>
        <PageHeader title="Audit log" />
        <EmptyState title="Your role cannot open the audit log" hint="Ask a manager or admin if you need to see a change history." />
      </>
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
    { key: 'ref', header: 'Reference', render: (a) => <span className={related(a).to ? 'm5-reflink' : undefined}>{a.resourceId}</span> },
  ]

  return (
    <>
      <PageHeader
        crumb={{ label: 'Audit log', to: '/audit' }}
        title="Audit log"
        subtitle="Read-only history of changes in your permitted workspace."
      />

      <div className="m5-auditfilters">
        <label className="m5-field">
          <span>Search</span>
          <input
            type="search" placeholder="Search person, action or reference" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </label>
        <label className="m5-field">
          <span>Action</span>
          <select value={action} onChange={(e) => { setAction(e.target.value); setPage(1) }}>
            <option value="">All actions</option>
            {Object.entries(ACTION_LABEL).map(([code, text]) => <option key={code} value={code}>{text}</option>)}
          </select>
        </label>
        <label className="m5-field">
          <span>Date range</span>
          <select value={range} onChange={(e) => { setRange(e.target.value as typeof range); setPage(1) }}>
            {RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>
        </label>
      </div>

      <div className="m5-auditgrid">
        <DataTable
          columns={columns} rows={items} rowKey={(a) => a.id}
          loading={audit.isPending} error={audit.isError ? errorMessage(audit.error) : null} onRetry={() => audit.refetch()}
          onRowClick={(a) => setSelectedId(a.id)} skeletonRows={PAGE_SIZE}
          rowClassName={(a) => (a.id === selected?.id ? 'is-selected' : '')}
          empty={<EmptyState title="No events match" hint="Try another search, action or date range." />}
          footer={
            audit.data && (
              <>
                <Pager page={audit.data.page} pageSize={audit.data.pageSize} total={audit.data.total} onPage={setPage} noun="event" />
                <p className="m5-tablenote">Times shown in {APP_TZ}</p>
              </>
            )
          }
        />

        <aside className="m5-card m5-details" aria-label="Event details">
          <div className="m5-details-head">
            <h2>Event details</h2>
            <span className="m5-badge st-active">Read-only</span>
          </div>
          {selected ? (
            <dl>
              <dt>Event</dt><dd><strong>{selected.id}</strong></dd>
              <dt>Action</dt><dd><strong>{actionLabel(selected.action)}</strong></dd>
              <dt>Person</dt><dd><strong>{selected.actorName}{selected.actorRole !== 'SYSTEM' && ` · ${roleLabel(selected.actorRole)}`}</strong></dd>
              <dt>Occurred</dt><dd><strong>{formatFull(selected.createdAt)}</strong></dd>
              <dt>Related record</dt>
              <dd><strong>{rel?.to ? <Link to={rel.to}>{rel.text}</Link> : rel?.text}</strong></dd>
              <dt>Details</dt><dd><strong>{summary(selected)}</strong></dd>
              {changed.length > 0 && (
                <>
                  <dt>Changes</dt>
                  <dd>
                    <ul className="m5-changes">
                      {changed.map((k) => (
                        <li key={k}>
                          <code className="m5-code">{k}</code>{' '}
                          <span className="m5-before">{SHOWN((selected.before as Record<string, unknown>)[k])}</span>
                          {' → '}
                          <span className="m5-after">{SHOWN((selected.after as Record<string, unknown>)[k])}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </>
              )}
            </dl>
          ) : (
            <p className="m5-sub">Select an event to see its details.</p>
          )}
        </aside>
      </div>
    </>
  )
}
