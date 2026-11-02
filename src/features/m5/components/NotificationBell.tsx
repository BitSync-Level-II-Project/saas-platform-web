import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMarkAllRead, useMarkRead, useNotifications, useUnreadCount } from '../api/hooks'
import { useNow } from '../lib/hooks'
import { timeAgo } from '../lib/format'
import { SeverityBadge } from './Badges'
import { showToast } from './toast'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const prevCount = useRef<number | null>(null)
  const navigate = useNavigate()
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
      showToast('info', `You have ${count - prevCount.current} new notification${count - prevCount.current > 1 ? 's' : ''}.`)
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
    <div className="m5-bell" ref={wrapRef}>
      <button
        type="button" className="m5-iconbtn" aria-haspopup="true" aria-expanded={open}
        aria-label={count > 0 ? `Notifications, ${count} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {count > 0 && <span className="m5-bell-count">{count > 99 ? '99+' : count}</span>}
      </button>

      {open && (
        <div className="m5-dropdown" role="region" aria-label="Latest notifications">
          <div className="m5-dropdown-head">
            <strong>Notifications</strong>
            <button type="button" className="m5-link" disabled={count === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
              Mark all as read
            </button>
          </div>
          {latest.isPending ? (
            <p className="m5-dropdown-note">Loading…</p>
          ) : latest.data && latest.data.length > 0 ? (
            <ul>
              {latest.data.map((n) => (
                <li key={n.id}>
                  <button
                    type="button" className={n.readAt ? 'read' : 'unread'}
                    onClick={() => {
                      if (!n.readAt) markRead.mutate(n.id)
                      setOpen(false)
                      if (n.alertId) navigate(`/alerts/${n.alertId}`)
                    }}
                  >
                    <span className="m5-dot" aria-label={n.readAt ? 'Read' : 'Unread'} />
                    <span className="m5-notif-body">
                      <span className="m5-notif-title">{n.title}</span>
                      <span className="m5-notif-text">{n.status === 'FAILED' ? (n.failureReason ?? 'Delivery failed.') : n.body}</span>
                      <span className="m5-notif-meta">
                        {n.severity && <SeverityBadge level={n.severity} />}
                        {timeAgo(n.createdAt, now)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="m5-dropdown-note">You are all caught up.</p>
          )}
          <Link to="/notifications" className="m5-dropdown-foot" onClick={() => setOpen(false)}>View all notifications</Link>
        </div>
      )}
    </div>
  )
}
