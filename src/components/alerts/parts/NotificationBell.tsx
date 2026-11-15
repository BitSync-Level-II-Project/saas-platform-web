import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from '../api/hooks'
import { useNow } from '../lib/hooks'
import { timeAgo } from '../lib/format'
import type { Nav } from '../navigation'
import { SeverityBadge } from './Badges'
import { showToast } from './toast'

/** The bell in the top bar. Same look as the static one (a dot when something is unread), but live. */
export function NotificationBell({ nav }: { nav: Nav }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef<number | null>(null)
  const now = useNow()

  const unread = useUnreadCount()
  const latest = useNotifications(5, open)
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()
  const count = unread.data?.count ?? 0

  // Toast when the unread count goes up (not on first load).
  useEffect(() => {
    if (unread.data === undefined) return
    if (prevCount.current !== null && count > prevCount.current) {
      const n = count - prevCount.current
      showToast('info', `You have ${n} new notification${n > 1 ? 's' : ''}.`)
    }
    prevCount.current = count
  }, [count, unread.data])

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="al-bellwrap" ref={wrapRef}>
      <button
        type="button" className="bell" aria-haspopup="true" aria-expanded={open}
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
      >
        <Bell size={22} />
        {count > 0 && <i className="bell-dot" />}
      </button>

      {open && (
        <div className="al-dropdown" role="region" aria-label="Latest notifications">
          <div className="al-dropdown-head">
            <strong>Notifications</strong>
            <button type="button" className="link-btn al-small-text" disabled={count === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
              Mark all as read
            </button>
          </div>
          {latest.isPending ? (
            <p className="al-dropdown-note">Loading…</p>
          ) : latest.data && latest.data.length > 0 ? (
            <ul>
              {latest.data.map((n) => (
                <li key={n.id}>
                  <button
                    type="button" className={n.readAt ? 'read' : 'unread'}
                    onClick={() => {
                      if (!n.readAt) markRead.mutate(n.id)
                      setOpen(false)
                      if (n.alertId) nav.openAlert(n.alertId)
                    }}
                  >
                    <span className="al-dot" aria-label={n.readAt ? 'Read' : 'Unread'} />
                    <span className="al-notif-body">
                      <span className="al-notif-title">{n.title}</span>
                      <span className="al-notif-text">{n.status === 'FAILED' ? (n.failureReason ?? 'Delivery failed.') : n.body}</span>
                      <span className="al-notif-meta">
                        {n.severity && <SeverityBadge level={n.severity} />}
                        {timeAgo(n.createdAt, now)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="al-dropdown-note">You are all caught up.</p>
          )}
          <button type="button" className="al-dropdown-foot" onClick={() => { setOpen(false); nav.openNotifications() }}>
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}
