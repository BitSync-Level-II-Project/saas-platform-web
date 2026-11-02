import type { Role } from '../types'
import { canViewAudit } from '../lib/permissions'
import type { NavIconName } from '../components/NavIcon'

export interface NavItem {
  to: string
  label: string
  icon: NavIconName
  allow?: (role: Role) => boolean
}

// Same order and labels as the Figma sidebar. Items owned by other modules open a placeholder
// until those modules are merged. When the team's layout exists, keep their sidebar and only
// make sure Alerts and Audit log are in it.
export const m5NavItems: NavItem[] = [
  { to: '/overview', label: 'Overview', icon: 'home' },
  { to: '/supervisors', label: 'Supervisors', icon: 'user' },
  { to: '/warehouses', label: 'Warehouses', icon: 'building' },
  { to: '/templates', label: 'Templates', icon: 'doc' },
  { to: '/tasks', label: 'Tasks', icon: 'tasks' },
  { to: '/collected-data', label: 'Collected data', icon: 'chart' },
  { to: '/alerts', label: 'Alerts', icon: 'bell' },
  { to: '/audit', label: 'Audit log', icon: 'clock', allow: canViewAudit },
]
