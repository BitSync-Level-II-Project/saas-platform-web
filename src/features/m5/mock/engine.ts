// Browser version of the backend event pipeline (guide C5 to C8):
// ingest event -> evaluate rules -> create alert -> notify -> audit.
import type {
  Alert, AlertActionName, AlertStatus, IngestInput, IngestResult, OperationalEvent, Role, Severity, User,
} from '../types'
import { ApiError } from '../lib/errors'
import { alertMessage, evaluate, getByPath } from '../lib/evaluate'
import { notifyOf } from '../lib/labels'
import { db, newId, writeAudit, type StoredRule } from './db'

function notify(roles: Role[], type: string, title: string, body: string, severity: Severity, alertId: string) {
  for (const u of db.users.filter((x) => roles.includes(x.role))) {
    const id = newId('NTF')
    db.notifications.unshift({
      id, recipientId: u.id, type, title, body, severity, alertId, status: 'SENT',
      readAt: null, createdAt: new Date().toISOString(),
    })
    writeAudit({ action: 'NOTIFICATION_GENERATED', resourceType: 'Notification', resourceId: id })
  }
}

function inCooldown(rule: StoredRule, event: OperationalEvent): boolean {
  if (rule.cooldownMinutes <= 0) return false
  const since = Date.now() - rule.cooldownMinutes * 60_000
  return db.alerts.some(
    (a) =>
      a.ruleId === rule.id &&
      a.deviceId === event.deviceId &&
      a.locationId === event.locationId &&
      a.status !== 'RESOLVED' &&
      Date.parse(a.createdAt) >= since,
  )
}

function createAlertFromRule(rule: StoredRule, event: OperationalEvent, value: number): Alert {
  const alert: Alert = {
    id: newId('ALT'), title: rule.name, message: alertMessage(rule, value), severity: rule.severity, status: 'NEW',
    ruleId: rule.id, eventId: event.id, siteId: event.siteId, locationId: event.locationId, deviceId: event.deviceId,
    escalationLevel: 0, createdAt: new Date().toISOString(),
  }
  db.alerts.unshift(alert)
  db.alertActions.push({ id: newId('ACT'), alertId: alert.id, action: 'CREATED', actorName: 'System', createdAt: alert.createdAt })
  writeAudit({ action: 'ALERT_CREATED', resourceType: 'Alert', resourceId: alert.id, after: alert })
  // Alert created: the supervisor, plus the manager when the rule says so (default: HIGH and CRITICAL).
  notify(
    notifyOf(rule) === 'SUPERVISOR_MANAGER' ? ['SUPERVISOR', 'MANAGER'] : ['SUPERVISOR'],
    'ALERT_CREATED', alert.title, alert.message, alert.severity, alert.id,
  )
  return alert
}

function processEvent(event: OperationalEvent): string[] {
  const matching = db.rules.filter(
    (r) =>
      r.enabled && !r.deletedAt &&
      (!r.siteId || r.siteId === event.siteId) &&
      (!r.locationId || r.locationId === event.locationId) &&
      (!r.templateId || r.templateId === event.templateId),
  )
  const created: string[] = []
  for (const rule of matching) {
    const value = Number(getByPath(event.payload, rule.fieldKey))
    if (Number.isNaN(value) || !evaluate(rule, value) || inCooldown(rule, event)) continue
    created.push(createAlertFromRule(rule, event, value).id)
  }
  return created
}

export function ingestEvent(input: IngestInput): IngestResult {
  const found = db.events.find((e) => e.clientEventId === input.clientEventId)
  if (found) return { id: found.id, duplicate: true, alertsCreated: [] }

  const event: OperationalEvent = { ...input, id: newId('EVT'), status: 'RECEIVED' }
  db.events.unshift(event)
  writeAudit({ action: 'EVENT_RECEIVED', resourceType: 'OperationalEvent', resourceId: event.id })
  try {
    const alertsCreated = processEvent(event)
    event.status = 'PROCESSED'
    writeAudit({ action: 'EVENT_PROCESSED', resourceType: 'OperationalEvent', resourceId: event.id })
    return { id: event.id, duplicate: false, alertsCreated }
  } catch (e) {
    event.status = 'FAILED'
    event.error = String(e)
    writeAudit({ action: 'EVENT_FAILED', resourceType: 'OperationalEvent', resourceId: event.id, outcome: 'FAILURE' })
    return { id: event.id, duplicate: false, alertsCreated: [], failed: true }
  }
}

// Allowed lifecycle moves. An illegal move is a 409, exactly like the real controller.
const ALLOWED: Record<AlertActionName, { from: AlertStatus[]; to: AlertStatus }> = {
  acknowledge: { from: ['NEW'], to: 'ACKNOWLEDGED' },
  resolve: { from: ['NEW', 'ACKNOWLEDGED', 'ESCALATED'], to: 'RESOLVED' },
  escalate: { from: ['NEW', 'ACKNOWLEDGED'], to: 'ESCALATED' },
}

export function actOnAlert(user: User, id: string, action: AlertActionName, note?: string): Alert {
  const alert = db.alerts.find((a) => a.id === id)
  if (!alert) throw new ApiError(404, 'Alert not found.')
  const move = ALLOWED[action]
  if (!move.from.includes(alert.status)) {
    throw new ApiError(409, `Cannot ${action} an alert that is ${alert.status.toLowerCase()}.`)
  }
  if ((action === 'resolve' || action === 'escalate') && !note?.trim()) {
    throw new ApiError(400, 'A note is required.')
  }

  const before = { ...alert }
  alert.status = move.to
  if (action === 'escalate') alert.escalationLevel += 1
  db.alertActions.push({
    id: newId('ACT'), alertId: id, action: action.toUpperCase(), actorName: user.name, note: note?.trim(),
    createdAt: new Date().toISOString(),
  })
  writeAudit({ actor: user, action: `ALERT_${move.to}`, resourceType: 'Alert', resourceId: id, before, after: { ...alert } })

  if (action === 'escalate') {
    notify(
      alert.escalationLevel >= 2 ? ['MANAGER', 'ADMIN'] : ['MANAGER'],
      'ALERT_ESCALATED', `${alert.title} escalated`, `Escalated by ${user.name}: ${note?.trim()}`, alert.severity, alert.id,
    )
  }
  if (action === 'resolve') {
    notify(['MANAGER'], 'ALERT_RESOLVED', `${alert.title} resolved`, `Resolved by ${user.name}.`, alert.severity, alert.id)
  }
  return alert
}
