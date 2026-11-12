import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText, 
  ClipboardList, 
  BarChart3, 
  Bell, 
  LogOut 
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { name: 'Overview', icon: LayoutDashboard, active: false },
    { name: 'Supervisors', icon: Users, active: false },
    { name: 'Warehouses', icon: Building2, active: true },
    { name: 'Templates', icon: FileText, active: false },
    { name: 'Tasks', icon: ClipboardList, active: false },
    { name: 'Collected data', icon: BarChart3, active: false },
    { name: 'Alerts', icon: Bell, active: false },
  ];

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div className="brand-header">
        <div className="brand-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M16 16L12 12M12 12L8 8M12 12L8 16M12 12L16 8" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="8" cy="8" r="3" fill="#4F46E5" />
            <circle cx="16" cy="8" r="3" fill="#4F46E5" />
            <circle cx="8" cy="16" r="3" fill="#4F46E5" />
            <circle cx="16" cy="16" r="3" fill="#4F46E5" />
          </svg>
        </div>
        <span className="brand-title">SiteTrace</span>
      </div>

      {/* Organization Badge */}
      <div className="org-card">
        <div className="org-name">Nova Industries</div>
        <div className="org-role">Manager</div>
      </div>

      {/* Navigation Links */}
      <nav className="nav-menu">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`nav-button ${item.active ? 'nav-button-active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar-circle">DW</div>
          <div className="user-info">
            <div className="user-name">Dinesh</div>
            <div className="user-sub">My profile</div>
          </div>
        </div>

        <button className="signout-button">
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}