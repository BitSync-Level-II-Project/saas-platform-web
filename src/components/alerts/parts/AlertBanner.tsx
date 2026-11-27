import { useUrgentAlerts } from '../api/hooks'
import type { Nav } from '../navigation'

/** HIGH and CRITICAL alerts stay on top of every page until somebody acknowledges them. */
export function AlertBanner({ nav }: { nav: Nav }) {
  const { data } = useUrgentAlerts()
  if (!data || data.length === 0) return null

  const worst = data.some((a) => a.severity === 'CRITICAL') ? 'critical' : 'high'
  const newest = data[0]
  return (
    <div className={`al-banner ${worst}`} role="alert">
      <span>
        <strong>{worst === 'critical' ? 'Critical alert' : 'High alert'}:</strong> {newest.title}
        {data.length > 1 && ` and ${data.length - 1} more waiting to be acknowledged`}
      </span>
      <button type="button" className="secondary-btn al-small" onClick={() => nav.openAlert(newest.id)}>Open alert</button>
    </div>
  )
}
