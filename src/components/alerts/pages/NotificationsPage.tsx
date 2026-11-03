import { useState } from 'react'
import { useMarkAllRead, useMarkRead, useNotifications } from '../api/hooks'
import { SeverityBadge, StatusBadge } from '../parts/Badges'
import { EmptyState } from '../parts/EmptyState'
import { PageHeader } from '../parts/PageHeader'
import { showToast } from '../parts/toast'
import { errorMessage } from '../lib/errors'
import { formatDateTime, timeAgo } from '../lib/format'
import { useNow } from '../lib/hooks'
import type { Nav } from '../navigation'

export function NotificationsPage({ nav }: { nav: Nav }) {
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const now = useNow()
  const list = useNotifications(50)
  const markRead = useMarkRead()
  const markAll = useMarkAllRead()

  const all = list.data ?? []
  const unreadCount = all.filter((n) => !n.readAt).length
  const shown = tab === 'unread' ? all.filter((n) => !n.readAt) : all

  return (
    <div className="page">
      <PageHeader
        title="Notifications" subtitle="Updates about alerts, escalations and delivery."
        back={{ label: 'Back to alerts', onClick: () => nav.openAlerts() }}
      />

      <div className="al-tabs" role="tablist" aria-label="Notification filter">
        <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')}>All</button>
        <button type="button" role="tab" aria-selected={tab === 'unread'} onClick={() => setTab('unread')}>
          Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </button>
        <span className="spacer" />
        <button
          type="button" className="secondary-btn al-small" disabled={unreadCount === 0 || markAll.isPending}
          onClick={() => markAll.mutate(undefined, { onSuccess: () => showToast('success', 'All notifications marked as read') })}
        >
          Mark all as read
        </button>
      </div>

      {list.isPending ? (
        <p className="al-note" role="status">Loading notifications…</p>
      ) : list.isError ? (
        <EmptyState title="Could not load notifications" hint={errorMessage(list.error)} />
      ) : shown.length === 0 ? (
        <EmptyState title={tab === 'unread' ? 'You are all caught up' : 'No notifications yet'} hint="New alerts and escalations will appear here." />
      ) : (
        <ul className="card al-notiflist">
          {shown.map((n) => (
            <li key={n.id}>
              <button
                type="button" className={n.readAt ? 'read' : 'unread'}
                onClick={() => {
                  if (!n.readAt) markRead.mutate(n.id)
                  if (n.alertId) nav.openAlert(n.alertId)
                }}
              >
                <span className="al-dot" aria-label={n.readAt ? 'Read' : 'Unread'} />
                <span className="al-notif-body">
                  <span className="al-notif-title">{n.title}</span>
                  <span className="al-notif-text">{n.body}</span>
                  {n.status === 'FAILED' && <span className="al-error">{n.failureReason ?? 'Delivery failed.'}</span>}
                  <span className="al-notif-meta" title={formatDateTime(n.createdAt)}>{timeAgo(n.createdAt, now)}</span>
                </span>
                <span className="al-notif-pills">
                  {n.severity && <SeverityBadge level={n.severity} />}
                  <StatusBadge status={n.status} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
