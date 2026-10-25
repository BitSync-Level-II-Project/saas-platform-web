import { Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="topbar">
      {/* Left Organization Breadcrumb */}
      <div className="breadcrumb">
        <span className="breadcrumb-org">Nova Industries</span>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-role">Manager</span>
      </div>

      {/* Right Notifications & Profile */}
      <div className="topbar-actions">
        <button className="notification-btn" title="Notifications">
          <Bell size={18} />
          <span className="notification-dot"></span>
        </button>

        <div className="topbar-avatar" title="Dinesh">
          DW
        </div>
      </div>
    </header>
  );
}