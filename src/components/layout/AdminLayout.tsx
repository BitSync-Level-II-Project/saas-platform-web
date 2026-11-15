import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Building2, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* 1. Sidebar Component */
const Sidebar: React.FC = () => {
  const { organization, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', to: '/admin/overview', icon: Home },
    { label: 'Managers', to: '/admin/managers', icon: Users },
    { label: 'Organization', to: '/admin/organization', icon: Building2 },
    { label: 'Alerts', to: '/admin/alerts', icon: Bell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center gap-2.5 font-bold tracking-tight text-slate-900 border-b border-slate-100">
        <svg
          width="26"
          height="26"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#5542f6]"
        >
          <path d="M8 8L18 16L8 24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="8" r="4" fill="currentColor" />
          <circle cx="8" cy="24" r="4" fill="currentColor" />
          <circle cx="24" cy="16" r="4" fill="currentColor" />
          <path d="M18 16H24" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <span className="text-xl">SiteTrace</span>
      </div>

      {/* Organization Badge Card */}
      <div className="p-4">
        <div className="bg-[#f8fafc] border border-slate-200/90 rounded-xl p-3.5">
          <p className="font-semibold text-sm text-slate-900 tracking-tight">
            {organization?.name || 'Nova Industries'}
          </p>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Company Admin
          </p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#f1efff] text-[#5542f6]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer with Logout */}
      <div className="p-4 border-t border-slate-100 space-y-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
        <div className="text-[11px] text-slate-400 px-3.5">
          BitSync · M1 Module
        </div>
      </div>
    </aside>
  );
};

/* 2. Topbar Component */
const Topbar: React.FC = () => {
  const { organization, user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-800">{organization?.name || 'Nova Industries'}</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 font-medium">Company Admin</span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#5542f6] rounded-full ring-2 ring-white"></span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-9 h-9 rounded-full bg-[#ede9fe] text-[#5542f6] flex items-center justify-center font-semibold text-xs border border-purple-200 hover:ring-2 hover:ring-purple-300 transition-all cursor-pointer"
          >
            {user?.avatarInitials || 'NP'}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-30">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">{user?.name || 'Nova Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@nova.example'}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

/* 3. Main Admin Layout Wrapper */
export const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
