import type { AutomationRule, Notify } from '../types'

export const NOTIFY_LABEL: Record<Notify, string> = {
  SUPERVISOR: 'Assigned Supervisor',
  SUPERVISOR_MANAGER: 'Supervisor + Manager',
}

/** Rules without an explicit choice follow the guide: HIGH and CRITICAL also reach the manager. */
export const notifyOf = (r: Pick<AutomationRule, 'notify' | 'severity'>): Notify =>
  r.notify ?? (r.severity === 'HIGH' || r.severity === 'CRITICAL' ? 'SUPERVISOR_MANAGER' : 'SUPERVISOR')

export const ACTION_LABEL: Record<string, string> = {
  RULE_CREATED: 'Rule created',
  RULE_UPDATED: 'Rule updated',
  RULE_ENABLED: 'Rule enabled',
  RULE_DISABLED: 'Rule disabled',
  RULE_DELETED: 'Rule deleted',
  EVENT_RECEIVED: 'Event received',
  EVENT_PROCESSED: 'Event processed',
  EVENT_FAILED: 'Event failed',
  ALERT_CREATED: 'Alert raised',
  ALERT_ACKNOWLEDGED: 'Alert acknowledged',
  ALERT_ESCALATED: 'Alert escalated',
  ALERT_RESOLVED: 'Alert resolved',
  NOTIFICATION_GENERATED: 'Notification sent',
  NOTIFICATION_FAILED: 'Notification failed',
  NOTIFICATION_READ: 'Notification read',
  TEMPLATE_PUBLISHED: 'Template published',
  SUBMISSION_APPROVED: 'Submission approved',
  TASK_ASSIGNED: 'Task assigned',
}

export const actionLabel = (code: string): string =>
  ACTION_LABEL[code] ?? code.charAt(0) + code.slice(1).replace(/_/g, ' ').toLowerCase()
