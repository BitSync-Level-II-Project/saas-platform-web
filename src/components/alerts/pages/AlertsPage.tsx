import { useState } from 'react'
import { useAlerts, useLookups } from '../api/hooks'
import { SeverityBadge, StatusBadge } from '../parts/Badges'
import { DataTable, Pager, type Column } from '../parts/DataTable'
import { EmptyState } from '../parts/EmptyState'
import { PageHeader } from '../parts/PageHeader'
import { SimulatePanel } from '../parts/SimulatePanel'
import { errorMessage } from '../lib/errors'
import { formatDateTime, SEVERITIES, timeAgo } from '../lib/format'
import { useDebounced, useNow } from '../lib/hooks'
import type { AlertsTab, Nav } from '../navigation'
import type { Alert, AlertStatus } from '../types'
import { RulesTab } from './RulesTab'

const PAGE_SIZE = 8
const TABS: { key: AlertsTab; label: string }[] = [
  { key: 'alerts', label: 'Alerts' },
  { key: 'resolved', label: 'Resolved' },
  { key: 'rules', label: 'Rules' },
]
const OPEN_STATUSES: AlertStatus[] = ['NEW', 'ACKNOWLEDGED', 'ESCALATED']
const label = (s: string) => s.charAt(0) + s.slice(1).toLowerCase()

export function AlertsPage({ nav, initialTab = 'alerts' }: { nav: Nav; initialTab?: AlertsTab }) {
  const [tab, setTab] = useState<AlertsTab>(initialTab)

  return (
    <div className="page">
      <PageHeader title="Alerts" subtitle="Monitor site alerts and manage the rules that create them." />

      <div className="al-tabs" role="tablist" aria-label="Alerts sections">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {tab === 'rules' ? <RulesTab nav={nav} /> : <AlertList key={tab} nav={nav} state={tab === 'resolved' ? 'resolved' : 'open'} />}
      </div>

      <p className="al-footnote">
        Sound recordings are reviewable evidence. No automatic machine-fault diagnosis is configured.
      </p>
    </div>
  )
}

function AlertList({ nav, state }: { nav: Nav; state: 'open' | 'resolved' }) {
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
      render: (a) => (<><div className="task-title">{a.title}</div><div className="al-sub">{a.message}</div></>),
    },
    { key: 'sev', header: 'Severity', render: (a) => <SeverityBadge level={a.severity} /> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} /> },
    {
      key: 'where', header: 'Warehouse',
      render: (a) => (<>{lookups.site(a.siteId)}<div className="al-sub">{lookups.location(a.locationId)} · {lookups.device(a.deviceId)}</div></>),
    },
    { key: 'time', header: 'Raised', render: (a) => <span title={formatDateTime(a.createdAt)}>{timeAgo(a.createdAt, now)}</span> },
    { key: 'lvl', header: 'Escalation', render: (a) => (a.escalationLevel > 0 ? `Level ${a.escalationLevel}` : '—') },
  ]

  return (
    <>
      {state === 'open' && <SimulatePanel onOpenAlert={nav.openAlert} />}

      <div className="toolbar">
        <input
          className="input search" type="search" placeholder="Search alerts" aria-label="Search alerts" value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select className="input status-filter" aria-label="Severity" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1) }}>
          <option value="">All severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
        </select>
        {state === 'open' && (
          <select className="input status-filter" aria-label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
            <option value="">All open statuses</option>
            {OPEN_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>
        )}
        <select className="input status-filter" aria-label="Warehouse" value={siteId} onChange={(e) => { setSiteId(e.target.value); setPage(1) }}>
          <option value="">All warehouses</option>
          {lookups.ref?.sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <span className="spacer" />
        <span className="al-updated" role="status">
          {alerts.isFetching ? 'Updating…' : `Updated ${timeAgo(alerts.dataUpdatedAt, now)}`}
        </span>
      </div>

      <DataTable
        columns={columns} rows={alerts.data?.items} rowKey={(a) => a.id}
        loading={alerts.isPending} error={alerts.isError ? errorMessage(alerts.error) : null} onRetry={() => alerts.refetch()}
        onRowClick={(a) => nav.openAlert(a.id)} skeletonRows={PAGE_SIZE}
        rowClassName={(a) => (a.severity === 'CRITICAL' && a.status !== 'RESOLVED' ? 'al-critical' : '')}
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
