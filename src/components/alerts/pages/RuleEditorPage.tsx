import { useState } from 'react'
import { useAuditLogs, useLookups, useRule, useSaveRule } from '../api/hooks'
import { EmptyState } from '../parts/EmptyState'
import { Field } from '../parts/Field'
import { PageHeader } from '../parts/PageHeader'
import { showToast } from '../parts/toast'
import { errorMessage } from '../lib/errors'
import { OPERATOR_SYMBOL, OPERATORS, ruleSentence } from '../lib/evaluate'
import { changedKeys, formatDateTime, SEVERITIES } from '../lib/format'
import { NOTIFY_LABEL } from '../lib/labels'
import { canEditRules } from '../lib/permissions'
import type { Nav } from '../navigation'
import { useSessionUser } from '../session'
import type { AutomationRule, Notify, Operator, RuleInput, Severity } from '../types'

interface FormState {
  name: string
  description: string
  siteId: string
  locationId: string
  templateId: string
  fieldKey: string
  operator: Operator
  thresholdValue: string
  thresholdMax: string
  severity: Severity
  notify: Notify
  cooldownMinutes: string
  enabled: boolean
}

const BLANK: FormState = {
  name: '', description: '', siteId: '', locationId: '', templateId: '', fieldKey: '', operator: 'GT',
  thresholdValue: '', thresholdMax: '', severity: 'MEDIUM', notify: 'SUPERVISOR', cooldownMinutes: '15', enabled: true,
}

const fromRule = (r: AutomationRule): FormState => ({
  name: r.name, description: r.description ?? '', siteId: r.siteId ?? '', locationId: r.locationId ?? '',
  templateId: r.templateId ?? '', fieldKey: r.fieldKey, operator: r.operator,
  thresholdValue: r.thresholdValue === undefined ? '' : String(r.thresholdValue),
  thresholdMax: r.thresholdMax === undefined ? '' : String(r.thresholdMax),
  severity: r.severity, notify: r.notify ?? (r.severity === 'HIGH' || r.severity === 'CRITICAL' ? 'SUPERVISOR_MANAGER' : 'SUPERVISOR'),
  cooldownMinutes: String(r.cooldownMinutes), enabled: r.enabled,
})

const num = (s: string): number | undefined => (s.trim() === '' || Number.isNaN(Number(s)) ? undefined : Number(s))

function validate(f: FormState): Partial<Record<keyof FormState, string>> {
  const e: Partial<Record<keyof FormState, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Enter a name (at least 2 characters).'
  if (!f.fieldKey) e.fieldKey = 'Choose the field to watch.'
  const min = num(f.thresholdValue)
  const max = num(f.thresholdMax)
  if (min === undefined) e.thresholdValue = 'Enter a number.'
  if (f.operator === 'BETWEEN') {
    if (max === undefined) e.thresholdMax = 'Enter a number.'
    else if (min !== undefined && max <= min) e.thresholdMax = 'Must be greater than the minimum.'
  }
  const cd = num(f.cooldownMinutes)
  if (cd === undefined || cd < 0 || !Number.isInteger(cd)) e.cooldownMinutes = 'Enter 0 or a whole number above.'
  return e
}

/** Loads the rule (when editing) and renders the form once it is ready. */
export function RuleEditorPage({ id, nav }: { id?: string; nav: Nav }) {
  const rule = useRule(id)
  const back = { label: 'Back to rules', onClick: () => nav.openAlerts('rules') }

  if (id && rule.isPending) return <div className="page"><p className="al-note" role="status">Loading rule…</p></div>
  if (id && (rule.isError || !rule.data)) {
    return (
      <div className="page">
        <PageHeader title="Rule not found" back={back} />
        <EmptyState title="We could not open this rule" hint={rule.isError ? errorMessage(rule.error) : undefined} />
      </div>
    )
  }
  return <RuleForm key={id ?? 'new'} rule={rule.data} nav={nav} />
}

function RuleForm({ rule, nav }: { rule?: AutomationRule; nav: Nav }) {
  const user = useSessionUser()
  const canEdit = canEditRules(user.role)
  const { ref } = useLookups()
  const save = useSaveRule()

  const [form, setForm] = useState<FormState>(rule ? fromRule(rule) : BLANK)
  const [submitted, setSubmitted] = useState(false)
  const [tab, setTab] = useState<'rule' | 'history'>('rule')
  const errors = validate(form)
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }))
  const back = { label: 'Back to rules', onClick: () => nav.openAlerts('rules') }

  // Locations follow the chosen warehouse. Fields follow the chosen template (or every known field).
  const locations = ref?.locations.filter((l) => !form.siteId || l.siteId === form.siteId) ?? []
  const templateFields = form.templateId
    ? (ref?.templates.find((t) => t.id === form.templateId)?.fields ?? [])
    : [...new Map((ref?.templates ?? []).flatMap((t) => t.fields).map((f) => [f.key, f])).values()]
  const fieldOptions = templateFields.some((f) => f.key === form.fieldKey) || !form.fieldKey
    ? templateFields
    : [...templateFields, { key: form.fieldKey, label: form.fieldKey }]

  if (!canEdit && !rule) {
    return (
      <div className="page">
        <PageHeader title="Create alert rule" back={back} />
        <EmptyState title="Your role cannot create rules" hint="Ask a manager or admin to add one." />
      </div>
    )
  }

  const draft: Partial<AutomationRule> = {
    fieldKey: form.fieldKey, operator: form.operator, thresholdValue: num(form.thresholdValue),
    thresholdMax: num(form.thresholdMax), severity: form.severity, cooldownMinutes: num(form.cooldownMinutes),
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    const input: RuleInput = {
      name: form.name.trim(), description: form.description.trim() || undefined,
      siteId: form.siteId || undefined, locationId: form.locationId || undefined, templateId: form.templateId || undefined,
      fieldKey: form.fieldKey, operator: form.operator, thresholdValue: num(form.thresholdValue),
      thresholdMax: form.operator === 'BETWEEN' ? num(form.thresholdMax) : undefined,
      severity: form.severity, notify: form.notify, enabled: form.enabled, cooldownMinutes: num(form.cooldownMinutes) ?? 0,
    }
    save.mutate({ id: rule?.id, input }, {
      onSuccess: () => { showToast('success', rule ? `Rule saved: ${input.name}` : `Rule created: ${input.name}`); nav.openAlerts('rules') },
      onError: (err) => showToast('error', errorMessage(err)),
    })
  }

  const err = (k: keyof FormState) => (submitted ? errors[k] : undefined)

  return (
    <div className="page">
      <PageHeader
        title={rule ? rule.name : 'Create alert rule'}
        subtitle={rule ? 'Change the condition, severity or scope. Every change is recorded in the audit log.' : 'Describe when an alert should be raised and who should hear about it.'}
        back={back}
      />

      {rule && (
        <div className="al-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === 'rule'} onClick={() => setTab('rule')}>Rule</button>
          <button type="button" role="tab" aria-selected={tab === 'history'} onClick={() => setTab('history')}>History</button>
        </div>
      )}

      {tab === 'history' && rule ? (
        <RuleHistory ruleId={rule.id} />
      ) : (
        <form className="card form-card" onSubmit={onSubmit} noValidate>
          {!canEdit && <p className="al-note">Your role can view this rule but not change it.</p>}
          <fieldset className="al-fieldset" disabled={!canEdit || save.isPending}>
            <Field label="Name" error={err('name')}>
              {(p) => <input {...p} className="input" value={form.name} onChange={(e) => set('name', e.target.value)} />}
            </Field>
            <Field label="Description (optional)">
              {(p) => <input {...p} className="input" value={form.description} onChange={(e) => set('description', e.target.value)} />}
            </Field>

            <div className="form-row">
              <Field label="Warehouse">
                {(p) => (
                  <select
                    {...p} className="input" value={form.siteId}
                    onChange={(e) => {
                      const siteId = e.target.value
                      setForm((f) => ({
                        ...f, siteId,
                        locationId: ref?.locations.find((l) => l.id === f.locationId)?.siteId === siteId ? f.locationId : '',
                      }))
                    }}
                  >
                    <option value="">All warehouses</option>
                    {ref?.sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Location">
                {(p) => (
                  <select {...p} className="input" value={form.locationId} onChange={(e) => set('locationId', e.target.value)}>
                    <option value="">All locations</option>
                    {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                )}
              </Field>
            </div>

            <div className="form-row">
              <Field label="Template">
                {(p) => (
                  <select
                    {...p} className="input" value={form.templateId}
                    onChange={(e) => {
                      const templateId = e.target.value
                      const keys = ref?.templates.find((t) => t.id === templateId)?.fields.map((f) => f.key)
                      setForm((f) => ({ ...f, templateId, fieldKey: !keys || keys.includes(f.fieldKey) ? f.fieldKey : '' }))
                    }}
                  >
                    <option value="">Any template</option>
                    {ref?.templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Field to watch" error={err('fieldKey')}>
                {(p) => (
                  <select {...p} className="input" value={form.fieldKey} onChange={(e) => set('fieldKey', e.target.value)}>
                    <option value="">Choose a field</option>
                    {fieldOptions.map((f) => <option key={f.key} value={f.key}>{f.label} ({f.key})</option>)}
                  </select>
                )}
              </Field>
            </div>

            <div className="form-row">
              <Field label="Operator">
                {(p) => (
                  <select {...p} className="input" value={form.operator} onChange={(e) => set('operator', e.target.value as Operator)}>
                    {OPERATORS.map((o) => <option key={o} value={o}>{OPERATOR_SYMBOL[o]} ({o.toLowerCase()})</option>)}
                  </select>
                )}
              </Field>
              <Field label={form.operator === 'BETWEEN' ? 'Minimum' : 'Threshold'} error={err('thresholdValue')}>
                {(p) => <input {...p} className="input" inputMode="decimal" value={form.thresholdValue} onChange={(e) => set('thresholdValue', e.target.value)} />}
              </Field>
            </div>
            {form.operator === 'BETWEEN' && (
              <div className="form-row">
                <Field label="Maximum" error={err('thresholdMax')}>
                  {(p) => <input {...p} className="input" inputMode="decimal" value={form.thresholdMax} onChange={(e) => set('thresholdMax', e.target.value)} />}
                </Field>
              </div>
            )}

            <div className="form-row">
              <Field label="Severity">
                {(p) => (
                  <select {...p} className="input" value={form.severity} onChange={(e) => set('severity', e.target.value as Severity)}>
                    {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                  </select>
                )}
              </Field>
              <Field label="Notify" hint="High and critical rules usually notify the manager too.">
                {(p) => (
                  <select {...p} className="input" value={form.notify} onChange={(e) => set('notify', e.target.value as Notify)}>
                    {(Object.keys(NOTIFY_LABEL) as Notify[]).map((n) => <option key={n} value={n}>{NOTIFY_LABEL[n]}</option>)}
                  </select>
                )}
              </Field>
            </div>

            <div className="form-row">
              <Field label="Cooldown (minutes)" hint="No repeat alert for the same device while one is still open." error={err('cooldownMinutes')}>
                {(p) => <input {...p} className="input" inputMode="numeric" value={form.cooldownMinutes} onChange={(e) => set('cooldownMinutes', e.target.value)} />}
              </Field>
              <label className="al-check">
                <input type="checkbox" checked={form.enabled} onChange={(e) => set('enabled', e.target.checked)} />
                <span>Rule is active</span>
              </label>
            </div>
          </fieldset>

          <p className="al-sentence" aria-live="polite">{ruleSentence(draft)}</p>

          {canEdit && (
            <div className="form-actions">
              <button type="button" className="secondary-btn" onClick={back.onClick}>Cancel</button>
              <button type="submit" className="primary-btn" disabled={save.isPending}>
                {save.isPending ? 'Saving…' : rule ? 'Save changes' : 'Create alert rule'}
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  )
}

function RuleHistory({ ruleId }: { ruleId: string }) {
  const history = useAuditLogs({ resourceType: 'AutomationRule', resourceId: ruleId })

  if (history.isPending) return <p className="al-note" role="status">Loading history…</p>
  if (history.isError) return <EmptyState title="Could not load history" hint={errorMessage(history.error)} />
  if (history.data.items.length === 0) return <EmptyState title="No changes recorded yet" />

  return (
    <ol className="al-history">
      {history.data.items.map((a) => {
        const changed = changedKeys(a.before, a.after)
        return (
          <li key={a.id} className="card al-pad">
            <div>
              <strong>{a.action.replace('RULE_', '').toLowerCase().replace(/^./, (c) => c.toUpperCase())}</strong>
              {' by '}{a.actorName}
              <div className="al-sub">{formatDateTime(a.createdAt)}</div>
            </div>
            {changed.length > 0 && (
              <ul>
                {changed.map((k) => (
                  <li key={k}>
                    <code className="al-code">{k}</code>{' '}
                    {String((a.before as Record<string, unknown>)[k] ?? '—')} → {String((a.after as Record<string, unknown>)[k] ?? '—')}
                  </li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ol>
  )
}
