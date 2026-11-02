import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDeleteRule, useLookups, useRules, useToggleRule } from '../api/hooks'
import { RuleStatusBadge, SeverityBadge } from '../components/Badges'
import { DataTable, Pager, type Column } from '../components/DataTable'
import { ReasonDialog } from '../components/Dialogs'
import { EmptyState } from '../components/EmptyState'
import { Switch } from '../components/Switch'
import { showToast } from '../components/toast'
import { errorMessage } from '../lib/errors'
import { conditionText } from '../lib/evaluate'
import { SEVERITIES } from '../lib/format'
import { useDebounced } from '../lib/hooks'
import { NOTIFY_LABEL, notifyOf } from '../lib/labels'
import { canEditRules } from '../lib/permissions'
import { useSessionUser } from '../session'
import type { AutomationRule } from '../types'

const PAGE_SIZE = 8

/** The "Rules" tab on the Alerts page. */
export function RulesTab() {
  const navigate = useNavigate()
  const user = useSessionUser()
  const canEdit = canEditRules(user.role)
  const lookups = useLookups()

  const [search, setSearch] = useState('')
  const [severity, setSeverity] = useState('')
  const [enabled, setEnabled] = useState('')
  const [siteId, setSiteId] = useState('')
  const [page, setPage] = useState(1)
  const [deleting, setDeleting] = useState<AutomationRule | null>(null)
  const debouncedSearch = useDebounced(search)

  const rules = useRules({ search: debouncedSearch, severity, enabled, siteId, page, pageSize: PAGE_SIZE })
  const toggle = useToggleRule()
  const remove = useDeleteRule()
  const filtered = !!(debouncedSearch || severity || enabled || siteId)

  const columns: Column<AutomationRule>[] = [
    {
      key: 'name', header: 'Rule',
      render: (r) => (
        <>
          <Link to={`/rules/${r.id}`} className="m5-rowtitle" onClick={(e) => e.stopPropagation()}>{r.name}</Link>
          <small className="m5-sub">{r.description ?? conditionText(r)}</small>
        </>
      ),
    },
    {
      key: 'scope', header: 'Scope',
      render: (r) => (
        <>
          {r.locationId ? lookups.location(r.locationId) : r.siteId ? lookups.site(r.siteId) : 'All warehouses'}
          {r.templateId && <small className="m5-sub">{lookups.template(r.templateId)}</small>}
        </>
      ),
    },
    { key: 'notify', header: 'Notify', render: (r) => NOTIFY_LABEL[notifyOf(r)] },
    { key: 'sev', header: 'Severity', render: (r) => <SeverityBadge level={r.severity} /> },
    {
      key: 'status', header: 'Status',
      render: (r) => (
        <span className="m5-statuscell" onClick={(e) => e.stopPropagation()}>
          <RuleStatusBadge enabled={r.enabled} />
          <Switch
            checked={r.enabled} label={`${r.enabled ? 'Pause' : 'Activate'} ${r.name}`}
            disabled={!canEdit || (toggle.isPending && toggle.variables?.id === r.id)}
            onChange={(next) =>
              toggle.mutate({ id: r.id, enabled: next }, {
                onSuccess: () => showToast('success', next ? `Rule activated: ${r.name}` : `Rule paused: ${r.name}`),
                onError: (e) => showToast('error', errorMessage(e)),
              })
            }
          />
        </span>
      ),
    },
    {
      key: 'act', header: '', className: 'm5-actions',
      render: (r) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Link to={`/rules/${r.id}`} className="m5-btn small">{canEdit ? 'Edit' : 'View'}</Link>
          {canEdit && <button type="button" className="m5-btn small danger-ghost" onClick={() => setDeleting(r)}>Delete</button>}
        </span>
      ),
    },
  ]

  return (
    <>
      <div className="m5-toolbar">
        <div className="m5-filters">
          <input
            type="search" placeholder="Search rules" aria-label="Search rules" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
          <select aria-label="Severity" value={severity} onChange={(e) => { setSeverity(e.target.value); setPage(1) }}>
            <option value="">All severities</option>
            {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
          </select>
          <select aria-label="Status" value={enabled} onChange={(e) => { setEnabled(e.target.value); setPage(1) }}>
            <option value="">Active and paused</option>
            <option value="true">Active only</option>
            <option value="false">Paused only</option>
          </select>
          <select aria-label="Warehouse" value={siteId} onChange={(e) => { setSiteId(e.target.value); setPage(1) }}>
            <option value="">All warehouses</option>
            {lookups.ref?.sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {canEdit && <Link to="/rules/new" className="m5-btn primary">Create alert rule</Link>}
      </div>

      {!canEdit && <p className="m5-note">Your role can view rules but not change them.</p>}

      <DataTable
        columns={columns} rows={rules.data?.items} rowKey={(r) => r.id}
        loading={rules.isPending} error={rules.isError ? errorMessage(rules.error) : null} onRetry={() => rules.refetch()}
        onRowClick={(r) => navigate(`/rules/${r.id}`)} skeletonRows={PAGE_SIZE}
        empty={
          <EmptyState
            title={filtered ? 'No rules match these filters' : 'No rules yet'}
            hint={filtered ? 'Clear a filter or change the search.' : 'Create a rule to start raising alerts automatically.'}
            action={!filtered && canEdit ? <Link to="/rules/new" className="m5-btn primary">Create alert rule</Link> : undefined}
          />
        }
        footer={rules.data && <Pager page={rules.data.page} pageSize={rules.data.pageSize} total={rules.data.total} onPage={setPage} />}
      />

      {deleting && (
        <ReasonDialog
          title={`Delete rule: ${deleting.name}`} label="Why are you deleting this rule?" confirmLabel="Delete rule" danger
          busy={remove.isPending} onCancel={() => setDeleting(null)}
          onConfirm={(reason) =>
            remove.mutate({ id: deleting.id, reason }, {
              onSuccess: () => { showToast('success', `Rule deleted: ${deleting.name}`); setDeleting(null) },
              onError: (e) => showToast('error', errorMessage(e)),
            })
          }
        />
      )}
    </>
  )
}
