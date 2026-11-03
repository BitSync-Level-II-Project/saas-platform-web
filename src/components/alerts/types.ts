// Shared types. Names match the planned backend contract,
// so the real API can replace the mock layer without touching the UI.

export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED'
export type Operator = 'GT' | 'GTE' | 'LT' | 'LTE' | 'EQ' | 'NEQ' | 'BETWEEN'
export type NotifStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED'
export type Role = 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'WORKER'
export type AlertActionName = 'acknowledge' | 'resolve' | 'escalate'
/** Who a rule notifies. Matches the Notify column in the Figma rules table. */
export type Notify = 'SUPERVISOR' | 'SUPERVISOR_MANAGER'
export type EventSource = 'FIELD_SUBMISSION' | 'STATIONED_TELEMETRY' | 'HEARTBEAT'

export interface Page<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface AutomationRule {
  id: string
  name: string
  description?: string
  siteId?: string
  locationId?: string
  templateId?: string
  fieldKey: string
  operator: Operator
  thresholdValue?: number
  thresholdMax?: number
  severity: Severity
  /** Leave empty to use the default for the severity (HIGH and CRITICAL also notify the manager). */
  notify?: Notify
  enabled: boolean
  cooldownMinutes: number
  updatedAt: string
}

/** What the rule editor sends when creating or updating a rule. */
export type RuleInput = Omit<AutomationRule, 'id' | 'updatedAt'>

export interface OperationalEvent {
  id: string
  clientEventId: string
  sourceType: EventSource
  deviceId?: string
  userId?: string
  siteId?: string
  locationId?: string
  templateId?: string
  payload: Record<string, unknown>
  occurredAt: string
  status: 'RECEIVED' | 'PROCESSED' | 'FAILED'
  error?: string
}

/** The one function the field submissions and the stationed phone call to report a reading. */
export type IngestInput = Omit<OperationalEvent, 'id' | 'status' | 'error'>

export interface IngestResult {
  id: string
  duplicate: boolean
  alertsCreated: string[]
  failed?: boolean
}

export interface Alert {
  id: string
  title: string
  message: string
  severity: Severity
  status: AlertStatus
  ruleId: string
  eventId: string
  siteId?: string
  locationId?: string
  deviceId?: string
  escalationLevel: number
  createdAt: string
}

export interface AlertAction {
  id: string
  alertId: string
  action: string
  actorName: string
  note?: string
  createdAt: string
}

/** GET /alerts/:id returns the alert with its rule, triggering event and timeline. */
export interface AlertDetails extends Alert {
  rule?: AutomationRule
  event?: OperationalEvent
  actions: AlertAction[]
}

export interface AppNotification {
  id: string
  type: string
  title: string
  body: string
  severity?: Severity
  alertId?: string
  status: NotifStatus
  failureReason?: string
  readAt?: string | null
  createdAt: string
}

export interface AuditLog {
  id: string
  actorName: string
  actorRole: string
  action: string
  resourceType: string
  resourceId: string
  outcome: 'SUCCESS' | 'FAILURE'
  before?: unknown
  after?: unknown
  createdAt: string
}

// Reference data owned by other modules (users, warehouses and devices, templates).
// Replace the mock with their real endpoints when those modules are merged.
export interface Tenant { id: string; name: string }
export interface User { id: string; name: string; role: Role }
export interface Site { id: string; name: string }
export interface Location { id: string; siteId: string; name: string }
export interface Device { id: string; siteId: string; locationId: string; name: string }
export interface TemplateField { key: string; label: string; unit?: string }
export interface Template { id: string; name: string; fields: TemplateField[] }
export interface Reference {
  tenant: Tenant
  sites: Site[]
  locations: Location[]
  devices: Device[]
  templates: Template[]
}
