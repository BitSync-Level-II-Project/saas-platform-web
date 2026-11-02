// One function per endpoint. Each has a mock branch and a real-API branch (paths from guide Appendix A).
// Part C swaps nothing in the UI: set VITE_USE_MOCK=false and the same functions call the backend.
import type {
  Alert, AlertActionName, AlertDetails, AppNotification, AuditLog, AutomationRule, IngestInput,
  IngestResult, Page, Reference, RuleInput,
} from '../types'
import * as mock from '../mock/handlers'
import { ingestEvent as mockIngest } from '../mock/engine'
import { mockCall } from '../mock/mockCall'
import { qs, request, USE_MOCK } from './client'

export type { AlertQuery, AuditQuery, RuleQuery } from '../mock/handlers'
type RuleQuery = mock.RuleQuery
type AlertQuery = mock.AlertQuery
type AuditQuery = mock.AuditQuery

// Sites, devices and templates belong to M2 and M3. Point this at their endpoints when merged.
export const getReference = (): Promise<Reference> =>
  USE_MOCK ? mockCall(mock.getReference) : request('GET', '/m5/reference')

// ----- rules -----
export const listRules = (q: RuleQuery): Promise<Page<AutomationRule>> =>
  USE_MOCK ? mockCall(() => mock.listRules(q)) : request('GET', `/automation-rules${qs(q)}`)

export const getRule = (id: string): Promise<AutomationRule> =>
  USE_MOCK ? mockCall(() => mock.getRule(id)) : request('GET', `/automation-rules/${id}`)

export const createRule = (input: RuleInput): Promise<AutomationRule> =>
  USE_MOCK ? mockCall(() => mock.createRule(input)) : request('POST', '/automation-rules', input)

export const updateRule = (id: string, input: RuleInput): Promise<AutomationRule> =>
  USE_MOCK ? mockCall(() => mock.updateRule(id, input)) : request('PATCH', `/automation-rules/${id}`, input)

export const setRuleEnabled = (id: string, enabled: boolean): Promise<AutomationRule> =>
  USE_MOCK ? mockCall(() => mock.setRuleEnabled(id, enabled)) : request('PATCH', `/automation-rules/${id}/enabled`, { enabled })

export const deleteRule = (id: string, reason: string): Promise<{ ok: true }> =>
  USE_MOCK ? mockCall(() => mock.deleteRule(id, reason)) : request('DELETE', `/automation-rules/${id}`, { reason })

// ----- events -----
export const ingestEvent = (input: IngestInput): Promise<IngestResult> =>
  USE_MOCK ? mockCall(() => mockIngest(input)) : request('POST', '/events', input)

// ----- alerts -----
export const listAlerts = (q: AlertQuery): Promise<Page<Alert>> =>
  USE_MOCK ? mockCall(() => mock.listAlerts(q)) : request('GET', `/alerts${qs(q)}`)

export const getAlert = (id: string): Promise<AlertDetails> =>
  USE_MOCK ? mockCall(() => mock.getAlert(id)) : request('GET', `/alerts/${id}`)

export const actOnAlert = (id: string, action: AlertActionName, note?: string): Promise<Alert> =>
  USE_MOCK ? mockCall(() => mock.actOnAlert(id, action, note)) : request('POST', `/alerts/${id}/${action}`, { note })

/** HIGH and CRITICAL alerts nobody has acknowledged yet (drives the banner). */
export async function getUrgentAlerts(): Promise<Alert[]> {
  const page = await listAlerts({ status: 'NEW', pageSize: 50 })
  return page.items.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL')
}

// ----- notifications -----
export const listNotifications = (limit = 20): Promise<AppNotification[]> =>
  USE_MOCK ? mockCall(() => mock.listNotifications(limit)) : request('GET', `/notifications${qs({ pageSize: limit })}`)

export const getUnreadCount = (): Promise<{ count: number }> =>
  USE_MOCK ? mockCall(mock.getUnreadCount, 80) : request('GET', '/notifications/unread-count')

export const markRead = (id: string): Promise<{ ok: true }> =>
  USE_MOCK ? mockCall(() => mock.markRead(id), 80) : request('PATCH', `/notifications/${id}/read`)

export const markAllRead = (): Promise<{ ok: true }> =>
  USE_MOCK ? mockCall(mock.markAllRead, 80) : request('PATCH', '/notifications/read-all')

// ----- audit -----
export const listAuditLogs = (q: AuditQuery): Promise<Page<AuditLog>> =>
  USE_MOCK ? mockCall(() => mock.listAuditLogs(q)) : request('GET', `/audit-logs${qs(q)}`)
