import { Link } from 'react-router-dom'
import { useUrgentAlerts } from '../api/hooks'

/** HIGH and CRITICAL alerts stay on top of every page until somebody acknowledges them. */
export function AlertBanner() {
  const { data } = useUrgentAlerts()
  if (!data || data.length === 0) return null

  const worst = data.some((a) => a.severity === 'CRITICAL') ? 'CRITICAL' : 'HIGH'
  const newest = data[0]
  return (
    <div className={`m5-banner ${worst.toLowerCase()}`} role="alert">
      <span>
        <strong>{worst === 'CRITICAL' ? 'Critical alert' : 'High alert'}:</strong> {newest.title}
        {data.length > 1 && ` and ${data.length - 1} more waiting to be acknowledged`}
      </span>
      <Link to={`/alerts/${newest.id}`} className="m5-btn small">Open alert</Link>
    </div>
  )
}
