import type { Role } from '../types'

// Matches the guide: ADMIN, MANAGER and SUPERVISOR can read rules; only MANAGER and ADMIN can write.
export const canViewRules = (r: Role) => r === 'ADMIN' || r === 'MANAGER' || r === 'SUPERVISOR'
export const canEditRules = (r: Role) => r === 'ADMIN' || r === 'MANAGER'
export const canActOnAlerts = (r: Role) => r === 'ADMIN' || r === 'MANAGER' || r === 'SUPERVISOR'
export const canViewAudit = (r: Role) => r === 'ADMIN' || r === 'MANAGER'
