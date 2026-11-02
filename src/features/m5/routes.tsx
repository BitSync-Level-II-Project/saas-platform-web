import { Navigate, type RouteObject } from 'react-router-dom'
import { AlertDetailsPage } from './pages/AlertDetailsPage'
import { AlertsPage } from './pages/AlertsPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { RuleEditorPage } from './pages/RuleEditorPage'

const other = (title: string) => (
  <PlaceholderPage title={title} planned="This screen belongs to another module. It will appear here once that module is merged." />
)

/** The only thing the app router needs from M5: spread these into the layout route's children. */
export const m5Routes: RouteObject[] = [
  // M5 screens
  { path: 'alerts', element: <AlertsPage /> },
  { path: 'alerts/:id', element: <AlertDetailsPage /> },
  { path: 'rules', element: <Navigate to="/alerts?tab=rules" replace /> },
  { path: 'rules/new', element: <RuleEditorPage /> },
  { path: 'rules/:id', element: <RuleEditorPage /> },
  { path: 'audit', element: <AuditLogPage /> },

  // Sidebar items owned by other modules
  { path: 'overview', element: other('Operations overview') },
  { path: 'supervisors', element: other('Supervisors') },
  { path: 'warehouses', element: other('Warehouses') },
  { path: 'templates', element: other('Templates') },
  { path: 'tasks', element: other('Tasks') },
  { path: 'collected-data', element: other('Collected data') },

  // Planned M5 screens, still reachable by URL or link
  { path: 'notifications', element: <PlaceholderPage title="Notifications" planned="Full list with All and Unread tabs, filters and notification preferences. The bell already shows your latest ones." /> },
  { path: 'events', element: <PlaceholderPage title="Events log" planned="Every incoming reading with its source, status and the alerts it created." /> },
  { path: 'operations', element: <PlaceholderPage title="Operations monitor" planned="Open alerts by severity, events in the last hour and device status on one page." /> },
  { path: 'devices/health', element: <PlaceholderPage title="Device health" planned="Stationed phones with battery, network, last heartbeat and a pairing code button." /> },
]
