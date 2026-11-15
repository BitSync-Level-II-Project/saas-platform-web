export type AlertsTab = 'alerts' | 'resolved' | 'rules'

/** How pages move around. App.tsx owns the current view and hands this to each page. */
export interface Nav {
  openAlerts: (tab?: AlertsTab) => void
  openAlert: (id: string) => void
  /** No id means a new rule. */
  openRule: (id?: string) => void
  openAudit: () => void
  openNotifications: () => void
}
