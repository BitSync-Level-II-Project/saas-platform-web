import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useLookups } from '../api/hooks'
import { AlertBanner } from '../components/AlertBanner'
import { Logo } from '../components/Logo'
import { NavIcon } from '../components/NavIcon'
import { NotificationBell } from '../components/NotificationBell'
import { Toaster } from '../components/Toaster'
import { initials, roleLabel } from '../lib/format'
import { setSessionUser, useSessionUser, useSessionUsers } from '../session'
import { m5NavItems } from './nav'
import '../m5.css'

/** Alerts also owns the rule editor pages, so keep it highlighted there. */
const isActive = (to: string, path: string) =>
  path === to || path.startsWith(`${to}/`) || (to === '/alerts' && path.startsWith('/rules'))

export function AppLayout() {
  const user = useSessionUser()
  const users = useSessionUsers()
  const { ref } = useLookups()
  const qc = useQueryClient()
  const { pathname } = useLocation()
  const visible = m5NavItems.filter((i) => !i.allow || i.allow(user.role))
  const tenant = ref?.tenant.name ?? '…'

  return (
    <div className="m5-shell">
      <aside className="m5-side">
        <Link to="/overview" className="m5-brand" aria-label="SiteTrace home"><Logo /></Link>
        <div className="m5-tenantcard" title="Everything you see belongs to this company only.">
          <strong>{tenant}</strong>
          <span>{roleLabel(user.role)}</span>
        </div>
        <nav aria-label="Main">
          {visible.map((i) => (
            <NavLink key={i.to} to={i.to} className={isActive(i.to, pathname) ? 'active' : ''}>
              <NavIcon name={i.icon} />
              <span>{i.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="m5-main">
        <header className="m5-top">
          <div className="m5-crumbs"><strong>{tenant}</strong><span>/ {roleLabel(user.role)}</span></div>
          <div className="m5-top-right">
            {pathname.startsWith('/alerts') && <Link to="/notifications" className="m5-toplink">Notifications</Link>}
            <label className="m5-role" title="Demo only. Switch the signed-in user until the real login is merged.">
              <span>Viewing as</span>
              <select
                value={user.id}
                onChange={(e) => { setSessionUser(e.target.value); qc.invalidateQueries() }}
              >
                {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({roleLabel(u.role)})</option>)}
              </select>
            </label>
            <NotificationBell />
            <span className="m5-avatar" role="img" aria-label={`Signed in as ${user.name}`}>{initials(user.name)}</span>
          </div>
        </header>
        <AlertBanner />
        <main className="m5-content"><Outlet /></main>
      </div>
      <Toaster />
    </div>
  )
}
