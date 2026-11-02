import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAlerts, useLookups } from '../api/hooks'
import { SeverityBadge, StatusBadge } from '../components/Badges'
import { DataTable, Pager, type Column } from '../components/DataTable'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { SimulatePanel } from '../components/SimulatePanel'
import { errorMessage } from '../lib/errors'
import { formatDateTime, SEVERITIES, timeAgo } from '../lib/format'
import { useDebounced, useNow } from '../lib/hooks'
import type { Alert, AlertStatus } from '../types'
import { RulesTab } from './RulesTab'

const PAGE_SIZE = 8
const TABS = [
  { key: 'alerts', label: 'Alerts' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'rules', label: 'Rules' },
] as const
const OPEN_STATUSES: AlertStatus[] = ['NEW', 'ACKNOWLEDGED', 'ESCALATED']
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()

export function AlertsPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.find((t) => t.key === params.get('tab'))?.key ?? 'alerts'

  return (
    <>
      <PageHeader title="Alerts" subtitle="Monitor site alerts and manage the rules that create them." />

      <div className="m5-tabs" role="tablist" aria-label="Alerts sections">
        {TABS.map((t) => (
          <button
            key={t.key} type="button" role="tab" aria-selected={tab === t.key}
            onClick={() => setParams(t.key === 'alerts' ? {} : { tab: t.key })}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'rules' ? <RulesTab /> : <AlertList key={tab} state={tab === 'resolved' ? 'resolved' : 'open'} />}
      </div>

      <p className="m5-footnote">
        Sound recordings are reviewable evidence. No automatic machine-fault diagnosis is configured.
      </p>
    </>
  )
}

function AlertList({ state }: { state: 'open' | 'resolved' }) {
  const navigate = useNavigate()
  const lookups = useLookups()
  const now = useNow(15_000)

  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [status, setStatus] = useState('')
  const [siteId, setSiteId] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounced(search)

  const alerts = useAlerts({ search: debouncedSearch, severity, status, siteId, state, page, pageSize: PAGE_SIZE })
  const filtered = !!(debouncedSearch || severity || status || siteId)

  const columns: Column<Alert>[] = [
    {
      key: 'title', header: 'Alert',
      render: (a) => (<><span className="m5-rowtitle">{a.title}</span><small className="m5-sub">{a.message}</small></>),
    },
    { key: 'sev', header: 'Severity', render: (a) => <SeverityBadge level={a.severity} /> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'where', header: 'Warehouse',
      render: (a) => (<>{lookups.site(a.siteId)}<small className="m5-sub">{lookups.location(a.locationId)} · {lookups.device(a.deviceId)}</small></>),
    },
    { key: 'time', header: 'Raised', render: (a) => <span title={formatDateTime(a.createdAt)}>{timeAgo(a.createdAt, now)}</span> },
    { key: 'lvl', header: 'Escalation', render: (a) => (a.escalationLevel > 0 ? `Level ${a.escalationLevel}` : '—') },
  ]

  return (
    <>
      {state === 'open' && <SimulatePanel />}

      <div className="m5-toolbar">
        <div className="m5-filters">
          <input
            type="search" placeholder="Search alerts" aria-label="Search alerts" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          <select aria-label="Severity" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1) }}>
            <option value="">All severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
          {state === 'open' && (
            <select aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
              <option value="">All open statuses</option>
              {OPEN_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
            </select>
          )}
          <select aria-label="Warehouse" value={siteId} onChange={(e) => { setSiteId(e.target.value); setPage(1) }}>
            <option value="">All warehouses</option>
            {lookups.ref?.sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <span className="m5-updated" role="status">
          {alerts.isFetching ? 'Updating…' : `Updated ${timeAgo(alerts.dataUpdatedAt, now)}`}
        </span>
      </div>

      <DataTable
        columns={columns} rows={alerts.data?.items} rowKey={(a) => a.id}
        loading={alerts.isPending} error={alerts.isError ? errorMessage(alerts.error) : null} onRetry={() => alerts.refetch()}
        onRowClick={(a) => navigate(`/alerts/${a.id}`)} skeletonRows={PAGE_SIZE}
        rowClassName={(a) => (a.severity === 'CRITICAL' && a.status !== 'RESOLVED' ? 'is-critical' : '')}
        empty={
          <EmptyState
            title={filtered ? 'No alerts match these filters' : state === 'open' ? 'No open alerts' : 'No resolved alerts yet'}
            hint={filtered ? 'Clear a filter or change the search.' : state === 'open' ? 'When a reading breaks a rule, the alert appears here.' : 'Alerts you resolve are kept here.'}
          />
        }
        footer={alerts.data && <Pager page={alerts.data.page} pageSize={alerts.data.pageSize} total={alerts.data.total} onPage={setPage} />}
      />
    </>
  )
}
