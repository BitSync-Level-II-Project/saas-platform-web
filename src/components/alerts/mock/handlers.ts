// Mock implementations of the REST endpoints listed in the guide (Appendix A).
// Each one is synchronous; api/alertsApi.ts wraps them with mockCall().
import type {
  Alert, AlertActionName, AlertDetails, AppNotification, AuditLog, AutomationRule, Page, Reference,
  RuleInput,
} from '../types'
import { ApiError } from '../lib/errors'
import { conditionText } from '../lib/evaluate'
import { actionLabel } from '../lib/labels'
import { getSessionUser } from '../session'
import { actOnAlert as engineAct } from './engine'
import { db, newId, writeAudit, type StoredRule } from './db'

export interface RuleQuery { page?: number; pageSize?: number; search?: string; severity?: string; enabled?: string; siteId?: string }
export interface AlertQuery { page?: number; pageSize?: number; severity?: string; status?: string; state?: 'open' | 'resolved'; siteId?: string; search?: string }
export interface AuditQuery { page?: number; pageSize?: number; resourceType?: string; resourceId?: string; action?: string; search?: string; from?: string }

export function paginate<T>(list: T[], page = 1, pageSize = 10): Page<T> {
  const start = (page - 1) * pageSize
  return { items: list.slice(start, start + pageSize), total: list.length, page, pageSize }
}

/** Copy of an object without the listed keys (strips server-only fields before data leaves the "API"). */
function omit<T extends object, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  return Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k as K))) as Omit<T, K>
}

const publicRule = (r: StoredRule): AutomationRule => omit(r, 'createdBy', 'deletedAt')
const contains = (text: string, q?: string) => !q || text.toLowerCase().includes(q.trim().toLowerCase())

export const getReference = (): Reference => ({
  tenant: db.tenant, sites: db.sites, locations: db.locations, devices: db.devices, templates: db.templates,
})

// ----- rules  -----

function validateRule(input: RuleInput) {
  if (input.name.trim().length < 2) throw new ApiError(400, 'Name is required.')
  if (!input.fieldKey) throw new ApiError(400, 'Choose the field to watch.')
  if (input.thresholdValue === undefined) throw new ApiError(400, 'Threshold is required.')
  if (input.operator === 'BETWEEN' && (input.thresholdMax === undefined || input.thresholdMax <= input.thresholdValue)) {
    throw new ApiError(400, 'For BETWEEN, the maximum must be greater than the minimum.')
  }
  if (input.cooldownMinutes < 0) throw new ApiError(400, 'Cooldown cannot be negative.')
}

const findRule = (id: string) => {
  const r = db.rules.find((x) => x.id === id && !x.deletedAt)
  if (!r) throw new ApiError(404, 'Rule not found.')
  return r
}

export function listRules(q: RuleQuery): Page<AutomationRule> {
  const rows = db.rules
    .filter((r) => !r.deletedAt)
    .filter((r) => contains(`${r.name} ${r.fieldKey} ${conditionText(r)}`, q.search))
    .filter((r) => !q.severity || r.severity === q.severity)
    .filter((r) => !q.enabled || String(r.enabled) === q.enabled)
    .filter((r) => !q.siteId || r.siteId === q.siteId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return paginate(rows.map(publicRule), q.page, q.pageSize)
}

export const getRule = (id: string): AutomationRule => publicRule(findRule(id))

export function createRule(input: RuleInput): AutomationRule {
  validateRule(input)
  const user = getSessionUser()
  const rule: StoredRule = { ...input, id: newId('RULE'), createdBy: user.id, updatedAt: new Date().toISOString() }
  db.rules.unshift(rule)
  writeAudit({ actor: user, action: 'RULE_CREATED', resourceType: 'AutomationRule', resourceId: rule.id, after: publicRule(rule) })
  return publicRule(rule)
}

export function updateRule(id: string, input: RuleInput): AutomationRule {
  validateRule(input)
  const rule = findRule(id)
  const before = publicRule(rule)
  Object.assign(rule, input, { updatedAt: new Date().toISOString() })
  writeAudit({ actor: getSessionUser(), action: 'RULE_UPDATED', resourceType: 'AutomationRule', resourceId: id, before, after: publicRule(rule) })
  return publicRule(rule)
}

export function setRuleEnabled(id: string, enabled: boolean): AutomationRule {
  const rule = findRule(id)
  const before = publicRule(rule)
  rule.enabled = enabled
  rule.updatedAt = new Date().toISOString()
  writeAudit({ actor: getSessionUser(), action: enabled ? 'RULE_ENABLED' : 'RULE_DISABLED', resourceType: 'AutomationRule', resourceId: id, before, after: publicRule(rule) })
  return publicRule(rule)
}

/** Soft delete: old alerts keep pointing at the rule. */
export function deleteRule(id: string, reason: string): { ok: true } {
  const rule = findRule(id)
  rule.deletedAt = new Date().toISOString()
  writeAudit({ actor: getSessionUser(), action: 'RULE_DELETED', resourceType: 'AutomationRule', resourceId: id, before: { ...publicRule(rule), reason } })
  return { ok: true }
}

// ----- alerts  -----

export function listAlerts(q: AlertQuery): Page<Alert> {
  const rows = db.alerts
    .filter((a) => !q.severity || a.severity === q.severity)
    .filter((a) => !q.status || a.status === q.status)
    .filter((a) => !q.state || (q.state === 'resolved') === (a.status === 'RESOLVED'))
    .filter((a) => !q.siteId || a.siteId === q.siteId)
    .filter((a) => contains(`${a.title} ${a.message}`, q.search))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return paginate(rows, q.page, q.pageSize)
}

export function getAlert(id: string): AlertDetails {
  const alert = db.alerts.find((a) => a.id === id)
  if (!alert) throw new ApiError(404, 'Alert not found.')
  const rule = db.rules.find((r) => r.id === alert.ruleId)
  return {
    ...alert,
    rule: rule && publicRule(rule),
    event: db.events.find((e) => e.id === alert.eventId),
    actions: db.alertActions.filter((a) => a.alertId === id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }
}

export const actOnAlert = (id: string, action: AlertActionName, note?: string): Alert =>
  engineAct(getSessionUser(), id, action, note)

// ----- notifications  -----

const mine = () => db.notifications.filter((n) => n.recipientId === getSessionUser().id)

export function listNotifications(limit = 20): AppNotification[] {
  return mine()
    .slice(0, limit)
    .map((n) => omit(n, 'recipientId'))
}

export const getUnreadCount = (): { count: number } => ({ count: mine().filter((n) => !n.readAt).length })

export function markRead(id: string): { ok: true } {
  const n = mine().find((x) => x.id === id)
  if (n && !n.readAt) {
    n.readAt = new Date().toISOString()
    writeAudit({ actor: getSessionUser(), action: 'NOTIFICATION_READ', resourceType: 'Notification', resourceId: id })
  }
  return { ok: true }
}

export function markAllRead(): { ok: true } {
  const now = new Date().toISOString()
  for (const n of mine()) if (!n.readAt) n.readAt = now
  writeAudit({ actor: getSessionUser(), action: 'NOTIFICATION_READ', resourceType: 'Notification', resourceId: 'all' })
  return { ok: true }
}

// ----- audit log -----

export function listAuditLogs(q: AuditQuery): Page<AuditLog> {
  const rows = db.auditLogs
    .filter((a) => !q.resourceType || a.resourceType === q.resourceType)
    .filter((a) => !q.resourceId || a.resourceId === q.resourceId)
    .filter((a) => !q.action || a.action === q.action)
    .filter((a) => !q.from || a.createdAt >= q.from)
    .filter((a) => contains(`${a.actorName} ${actionLabel(a.action)} ${a.resourceId}`, q.search))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((a) => omit(a, 'tenantId'))
  return paginate(rows, q.page, q.pageSize ?? 20)
}

