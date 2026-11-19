import { X } from 'lucide-react'
import { dismissToast, useToasts } from './toast'

export function Toaster() {
  const toasts = useToasts()
  return (
    <div className="al-toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`al-toast ${t.kind}`} role={t.kind === 'error' ? 'alert' : 'status'}>
          <span>{t.text}</span>
          {t.action && (
            <button type="button" className="al-toast-action" onClick={() => { t.action?.run(); dismissToast(t.id) }}>
              {t.action.label}
            </button>
          )}
          <button type="button" aria-label="Dismiss" onClick={() => dismissToast(t.id)}><X size={16} /></button>
        </div>
      ))}
    </div>
  )
}
