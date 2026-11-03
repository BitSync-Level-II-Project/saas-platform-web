// In-memory "database" that stands in for the backend until Part C exists.
// Everything resets on a page refresh. The shape mirrors the guide's tables.
import type {
  Alert, AlertAction, AlertStatus, AppNotification, AuditLog, AutomationRule, Device, Location,
  OperationalEvent, Site, Template, Tenant, User,
} from '../types'
import { alertMessage } from '../lib/evaluate'
import { notifyOf } from '../lib/labels'

export type StoredRule = AutomationRule & { createdBy: string; deletedAt?: string }
export type StoredNotification = AppNotification & { recipientId: string }

const MIN = 60_000
const ago = (min: number) => new Date(Date.now() - min * MIN).toISOString()

let counter = 1000
/** Readable ids such as ALT-1xx or RULE-1xx, shown in tables and in the audit log. */
export const newId = (prefix: string) => `${prefix}-${(++counter).toString(36).toUpperCase()}`

const tenant: Tenant = { id: 't-nova', name: 'Nova Industries' }
const users: User[] = [
  { id: 'u-admin', name: 'Nimali Perera', role: 'ADMIN' },
  { id: 'u-manager', name: 'Dinesh Wijesinghe', role: 'MANAGER' },
  { id: 'u-supervisor', name: 'Malith Senanayake', role: 'SUPERVISOR' },
]
const sites: Site[] = [
  { id: 's-colombo', name: 'Colombo warehouse' },
  { id: 's-kandy', name: 'Kandy warehouse' },
  { id: 's-galle', name: 'Galle warehouse' },
]
const locations: Location[] = [
  { id: 'l-machine', siteId: 's-colombo', name: 'Machine room' },
  { id: 'l-bay', siteId: 's-colombo', name: 'Loading bay' },
  { id: 'l-cold', siteId: 's-kandy', name: 'Cold store' },
  { id: 'l-pack', siteId: 's-galle', name: 'Packing hall' },
]
const devices: Device[] = [
  { id: 'd-phone01', siteId: 's-colombo', locationId: 'l-machine', name: 'Phone-01' },
  { id: 'd-phone02', siteId: 's-colombo', locationId: 'l-bay', name: 'Phone-02' },
  { id: 'd-phone03', siteId: 's-kandy', locationId: 'l-cold', name: 'Phone-03' },
]
const templates: Template[] = [
  {
    id: 't-inspection',
    name: 'Equipment inspection',
    fields: [
      { key: 'temperature', label: 'Temperature', unit: '°C' },
      { key: 'pressure', label: 'Hydraulic pressure', unit: 'bar' },
      { key: 'vibration', label: 'Vibration', unit: 'mm/s' },
    ],
  },
  {
    id: 't-telemetry',
    name: 'Stationed phone telemetry',
    fields: [
      { key: 'temperature', label: 'Temperature', unit: '°C' },
      { key: 'soundDb', label: 'Sound level', unit: 'dB' },
      { key: 'battery', label: 'Battery', unit: '%' },
      { key: 'minutesSinceContact', label: 'Minutes since last contact', unit: 'min' },
    ],
  },
]

const rule = (
  r: Omit<StoredRule, 'updatedAt' | 'createdBy' | 'enabled'> & { enabled?: boolean },
  minutesAgo: number,
): StoredRule => ({ enabled: true, createdBy: 'u-admin', updatedAt: ago(minutesAgo), ...r })

const rules: StoredRule[] = [
  rule({ id: 'RULE-014', name: 'High machine temperature', description: 'Temperature above 80 °C', siteId: 's-colombo', locationId: 'l-machine', fieldKey: 'temperature', operator: 'GT', thresholdValue: 80, severity: 'CRITICAL', notify: 'SUPERVISOR', cooldownMinutes: 1 }, 2900),
  rule({ id: 'RULE-015', name: 'Stationed phone offline', description: 'No server contact for 15 min', siteId: 's-colombo', fieldKey: 'minutesSinceContact', operator: 'GTE', thresholdValue: 15, severity: 'HIGH', notify: 'SUPERVISOR_MANAGER', cooldownMinutes: 15 }, 4300),
  rule({ id: 'RULE-016', name: 'Noise level high', description: 'Sound level above 85 dB', fieldKey: 'soundDb', operator: 'GT', thresholdValue: 85, severity: 'HIGH', notify: 'SUPERVISOR', cooldownMinutes: 15 }, 4300),
  rule({ id: 'RULE-017', name: 'Stationed phone battery low', description: 'Battery below 20 %', fieldKey: 'battery', operator: 'LT', thresholdValue: 20, severity: 'MEDIUM', notify: 'SUPERVISOR', cooldownMinutes: 30 }, 4300),
  rule({ id: 'RULE-018', name: 'Hydraulic pressure high', description: 'Pressure at or above 10 bar', siteId: 's-colombo', templateId: 't-inspection', fieldKey: 'pressure', operator: 'GTE', thresholdValue: 10, severity: 'HIGH', notify: 'SUPERVISOR', cooldownMinutes: 10 }, 4300),
  rule({ id: 'RULE-019', name: 'Vibration warning window', description: 'Vibration between 6 and 9 mm/s', templateId: 't-inspection', fieldKey: 'vibration', operator: 'BETWEEN', thresholdValue: 6, thresholdMax: 9, severity: 'LOW', notify: 'SUPERVISOR', cooldownMinutes: 20, enabled: false }, 1200),
]

const events: OperationalEvent[] = []
const alerts: Alert[] = []
const alertActions: AlertAction[] = []
const notifications: StoredNotification[] = []
const auditLogs: (AuditLog & { tenantId: string })[] = []

export const db = { tenant, users, sites, locations, devices, templates, rules, events, alerts, alertActions, notifications, auditLogs }

interface AuditEntry {
  actor?: User
  action: string
  resourceType: string
  resourceId: string
  before?: unknown
  after?: unknown
  outcome?: 'SUCCESS' | 'FAILURE'
  at?: string
}

/** Append only, like the real audit table. Before and after are copied so later edits never rewrite history. */
export function writeAudit(e: AuditEntry) {
  db.auditLogs.unshift({
    id: newId('AUD'),
    tenantId: tenant.id,
    actorName: e.actor?.name ?? 'System',
    actorRole: e.actor?.role ?? 'SYSTEM',
    action: e.action,
    resourceType: e.resourceType,
    resourceId: e.resourceId,
    before: e.before === undefined ? undefined : structuredClone(e.before),
    after: e.after === undefined ? undefined : structuredClone(e.after),
    outcome: e.outcome ?? 'SUCCESS',
    createdAt: e.at ?? new Date().toISOString(),
  })
}

// ---------- seed ----------

interface SeedRow { ago: number; rule: string; device: string; value: number; status: AlertStatus; level?: number }

const SEED_ALERTS: SeedRow[] = [
  { ago: 25, rule: 'RULE-014', device: 'd-phone01', value: 85, status: 'NEW' },
  { ago: 48, rule: 'RULE-014', device: 'd-phone01', value: 91, status: 'ESCALATED', level: 1 },
  { ago: 75, rule: 'RULE-018', device: 'd-phone01', value: 11.2, status: 'NEW' },
  { ago: 130, rule: 'RULE-016', device: 'd-phone01', value: 92, status: 'ACKNOWLEDGED' },
  { ago: 210, rule: 'RULE-017', device: 'd-phone03', value: 14, status: 'RESOLVED' },
  { ago: 400, rule: 'RULE-014', device: 'd-phone01', value: 83, status: 'RESOLVED' },
  { ago: 620, rule: 'RULE-016', device: 'd-phone02', value: 88, status: 'RESOLVED' },
  { ago: 900, rule: 'RULE-017', device: 'd-phone01', value: 18, status: 'RESOLVED' },
  { ago: 1500, rule: 'RULE-014', device: 'd-phone01', value: 87, status: 'RESOLVED' },
  { ago: 2000, rule: 'RULE-015', device: 'd-phone02', value: 22, status: 'RESOLVED' },
  { ago: 2800, rule: 'RULE-018', device: 'd-phone02', value: 10.4, status: 'RESOLVED' },
]

function seed() {
  const [admin, manager, supervisor] = users

  for (const r of rules) {
    writeAudit({ actor: admin, action: 'RULE_CREATED', resourceType: 'AutomationRule', resourceId: r.id, after: r, at: ago(4400) })
  }
  writeAudit({
    actor: manager, action: 'RULE_UPDATED', resourceType: 'AutomationRule', resourceId: 'RULE-014',
    before: { ...rules[0], thresholdValue: 75 }, after: rules[0], at: rules[0].updatedAt,
  })
  writeAudit({
    actor: manager, action: 'RULE_ENABLED', resourceType: 'AutomationRule', resourceId: 'RULE-014',
    before: { ...rules[0], enabled: false }, after: rules[0], at: ago(34),
  })
  // Entries written by other modules, so the audit log looks like the shared one in the Figma design.
  writeAudit({
    actor: manager, action: 'TEMPLATE_PUBLISHED', resourceType: 'Template', resourceId: 'TMP-04 · v1',
    after: { record: 'Equipment inspection · TMP-04', summary: 'Published version 1; 6 fields.' }, at: ago(28),
  })
  writeAudit({
    actor: supervisor, action: 'SUBMISSION_APPROVED', resourceType: 'Submission', resourceId: 'SUB-2081',
    after: { record: 'Submission SUB-2081', summary: 'Approved without changes.' }, at: ago(40),
  })
  writeAudit({
    actor: manager, action: 'TASK_ASSIGNED', resourceType: 'Task', resourceId: 'TSK-1042',
    after: { record: 'Task TSK-1042', summary: 'Assigned to Malith Senanayake.' }, at: ago(1100),
  })

  // A normal reading that raised nothing, so a later Events log shows a PROCESSED event without alerts.
  events.push({
    id: 'EVT-1000', clientEventId: 'seed-normal', sourceType: 'STATIONED_TELEMETRY',
    deviceId: 'd-phone01', siteId: 's-colombo', locationId: 'l-machine', payload: { temperature: 78, soundDb: 71, battery: 76 },
    occurredAt: ago(15), status: 'PROCESSED',
  })

  SEED_ALERTS.forEach((row, i) => {
    const r = rules.find((x) => x.id === row.rule)!
    const d = devices.find((x) => x.id === row.device)!
    const fromForm = r.templateId === 't-inspection'
    const ev: OperationalEvent = {
      id: `EVT-${1001 + i}`, clientEventId: `seed-${i}`,
      sourceType: fromForm ? 'FIELD_SUBMISSION' : r.fieldKey === 'minutesSinceContact' ? 'HEARTBEAT' : 'STATIONED_TELEMETRY',
      deviceId: d.id, siteId: d.siteId, locationId: d.locationId, templateId: fromForm ? 't-inspection' : undefined,
      userId: fromForm ? supervisor.id : undefined,
      payload: { [r.fieldKey]: row.value }, occurredAt: ago(row.ago), status: 'PROCESSED',
    }
    events.push(ev)

    const alert: Alert = {
      id: `ALT-${1001 + i}`, title: r.name, message: alertMessage(r, row.value), severity: r.severity,
      status: row.status, ruleId: r.id, eventId: ev.id, siteId: d.siteId, locationId: d.locationId,
      deviceId: d.id, escalationLevel: row.level ?? 0, createdAt: ago(row.ago),
    }
    alerts.push(alert)

    const act = (action: string, minutesAfter: number, note?: string, by?: User) => {
      alertActions.push({
        id: newId('ACT'), alertId: alert.id, action, actorName: by?.name ?? 'System', note, createdAt: ago(row.ago - minutesAfter),
      })
      if (action !== 'CREATED') {
        const to = ({ ACKNOWLEDGE: 'ACKNOWLEDGED', ESCALATE: 'ESCALATED', RESOLVE: 'RESOLVED' } as Record<string, string>)[action]
        writeAudit({ actor: by, action: `ALERT_${to}`, resourceType: 'Alert', resourceId: alert.id, at: ago(row.ago - minutesAfter) })
      } else {
        writeAudit({ action: 'ALERT_CREATED', resourceType: 'Alert', resourceId: alert.id, after: alert, at: alert.createdAt })
      }
    }
    act('CREATED', 0)
    if (row.status !== 'NEW') act('ACKNOWLEDGE', 4, undefined, supervisor)
    if (row.status === 'ESCALATED') act('ESCALATE', 9, 'Still above the limit after inspection.', supervisor)
    if (row.status === 'RESOLVED') act('RESOLVE', 15, 'Checked on site. Back within range.', supervisor)

    // Notifications for the newest alerts: read ones for older items, unread for the latest.
    if (i < 6) {
      const recipients = ['u-supervisor', ...(notifyOf(r) === 'SUPERVISOR_MANAGER' ? ['u-manager'] : [])]
      for (const rid of recipients) {
        notifications.push({
          id: `NTF-${1001 + i}-${rid.slice(2, 5).toUpperCase()}`, recipientId: rid, type: 'ALERT_CREATED', title: alert.title, body: alert.message,
          severity: r.severity, alertId: alert.id, status: 'DELIVERED', createdAt: alert.createdAt,
          readAt: row.status === 'RESOLVED' ? ago(row.ago - 20) : null,
        })
      }
    }
  })

  notifications.push(
    {
      id: 'NTF-1100', recipientId: 'u-manager', type: 'ALERT_ESCALATED', title: 'High machine temperature escalated',
      body: 'Escalated by Malith Senanayake: Still above the limit after inspection.', severity: 'CRITICAL', alertId: 'ALT-1002',
      status: 'DELIVERED', readAt: null, createdAt: ago(39),
    },
    {
      id: 'NTF-1101', recipientId: 'u-manager', type: 'ALERT_ESCALATED', title: 'High machine temperature escalated',
      body: 'Escalated by Malith Senanayake.', severity: 'CRITICAL', alertId: 'ALT-1002', status: 'FAILED',
      failureReason: 'Delivery worker timed out. It will retry automatically.', readAt: null, createdAt: ago(40),
    },
  )
  notifications.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

seed()
