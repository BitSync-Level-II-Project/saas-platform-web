import { Link } from 'react-router-dom'
import { dismissToast, useToasts } from './toast'

export function Toaster() {
  const toasts = useToasts()
  return (
    <div className="m5-toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`m5-toast ${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
          <span>{t.text}</span>
          {t.href && <Link to={t.href} onClick={() => dismissToast(t.id)}>View</Link>}
          <button type="button" aria-label="Dismiss" onClick={() => dismissToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}
