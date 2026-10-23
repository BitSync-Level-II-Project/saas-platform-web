import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="font-semibold text-slate-800">Nova Industries</span>
        <span className="text-slate-400">/</span>
        <span className="text-slate-500 font-medium">Company Admin</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#5542f6] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Initials Avatar */}
        <Link
          to="/login"
          title="Sign Out"
          className="w-9 h-9 rounded-full bg-[#ede9fe] text-[#5542f6] flex items-center justify-center font-semibold text-xs border border-purple-200 hover:ring-2 hover:ring-purple-300 transition-all cursor-pointer"
        >
          NP
        </Link>
      </div>
    </header>
  );
};