import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  Bell, Building2, ChartNoAxesColumn, ClipboardList, FileText, History, House, User,
} from 'lucide-react';
import './App.css';
import { useLookups } from './components/alerts/api/hooks';
import { canViewAudit } from './components/alerts/lib/permissions';
import { initials, roleLabel } from './components/alerts/lib/format';
import type { AlertsTab, Nav } from './components/alerts/navigation';
import { AlertBanner } from './components/alerts/parts/AlertBanner';
import { NotificationBell } from './components/alerts/parts/NotificationBell';
import { Toaster } from './components/alerts/parts/Toaster';
import { AlertDetailsPage } from './components/alerts/pages/AlertDetailsPage';
import { AlertsPage } from './components/alerts/pages/AlertsPage';
import { AuditLogPage } from './components/alerts/pages/AuditLogPage';
import { NotificationsPage } from './components/alerts/pages/NotificationsPage';
import { RuleEditorPage } from './components/alerts/pages/RuleEditorPage';
import { useSessionUser } from './components/alerts/session';
import siteTraceLogo from './assets/SiteTrace-logo.svg';

type View =
  | { name: 'alerts'; tab?: AlertsTab }
  | { name: 'alert-details'; id: string }
  | { name: 'rule-editor'; id?: string }
  | { name: 'audit' }
  | { name: 'notifications' };

type Section = 'Alerts' | 'Audit log';

// Only Alerts and Audit log are implemented in this module; the rest belong to other members.
const NAV = [
  { label: 'Overview', icon: House },
  { label: 'Supervisors', icon: User },
  { label: 'Warehouses', icon: Building2 },
  { label: 'Templates', icon: FileText },
  { label: 'Tasks', icon: ClipboardList },
  { label: 'Collected data', icon: ChartNoAxesColumn },
  { label: 'Alerts', icon: Bell },
  { label: 'Audit log', icon: History },
];

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
});

function Shell() {
  const [view, setView] = useState<View>({ name: 'alerts' });
  const user = useSessionUser();
  const { ref } = useLookups();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [view]);

  const nav: Nav = {
    openAlerts: (tab) => setView({ name: 'alerts', tab }),
    openAlert: (id) => setView({ name: 'alert-details', id }),
    openRule: (id) => setView({ name: 'rule-editor', id }),
    openAudit: () => setView({ name: 'audit' }),
    openNotifications: () => setView({ name: 'notifications' }),
  };

  const section: Section = view.name === 'audit' ? 'Audit log' : 'Alerts';
  const tenant = ref?.tenant.name ?? 'Nova Industries';

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src={siteTraceLogo} alt="SiteTrace" />
        </div>
        <div className="org-card">
          <strong>{tenant}</strong>
          <span>{roleLabel(user.role)}</span>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(({ label, icon: Icon }) => {
            const enabled = label === 'Alerts' || (label === 'Audit log' && canViewAudit(user.role));
            return (
              <button
                key={label}
                type="button"
                className={`nav-item ${label === section ? 'active' : ''}`}
                disabled={!enabled}
                onClick={label === 'Audit log' ? nav.openAudit : () => nav.openAlerts()}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="crumb">
            <strong>{tenant}</strong>
            <span>/ {roleLabel(user.role)}</span>
          </div>
          <div className="topbar-right">
            {view.name === 'alerts' && (
              <button type="button" className="link-btn" onClick={nav.openNotifications}>
                Notifications
              </button>
            )}
            <NotificationBell nav={nav} />
            <div className="avatar" role="img" aria-label={`Signed in as ${user.name}`}>
              {initials(user.name)}
            </div>
          </div>
        </header>

        <AlertBanner nav={nav} />

        {view.name === 'alerts' && <AlertsPage key={view.tab ?? 'alerts'} nav={nav} initialTab={view.tab} />}
        {view.name === 'alert-details' && <AlertDetailsPage key={view.id} id={view.id} nav={nav} />}
        {view.name === 'rule-editor' && <RuleEditorPage key={view.id ?? 'new'} id={view.id} nav={nav} />}
        {view.name === 'audit' && <AuditLogPage nav={nav} />}
        {view.name === 'notifications' && <NotificationsPage nav={nav} />}
      </div>
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Shell />
    </QueryClientProvider>
  );
}

export default App;
