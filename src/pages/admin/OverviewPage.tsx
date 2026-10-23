import React, { useState } from 'react';
import { X } from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State matching your Figma overview data
  const [activeCount] = useState(3);
  const [pendingCount, setPendingCount] = useState(1);
  const [alertCount] = useState(1);

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [activityLogs, setActivityLogs] = useState([
    {
      id: '1',
      name: 'Amali Gunasekara',
      role: 'Manager',
      activity: 'Account registered · Activation pending',
      when: 'Today, 09:15',
    },
    {
      id: '2',
      name: 'Dinesh Wijesinghe',
      role: 'Manager',
      activity: 'Signed in',
      when: 'Today, 08:45',
    },
  ]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    // Add new activity log
    setActivityLogs([
      {
        id: String(Date.now()),
        name: newName,
        role: 'Manager',
        activity: 'Account registered · Activation pending',
        when: 'Just now',
      },
      ...activityLogs,
    ]);

    setPendingCount((prev) => prev + 1);
    setNewName('');
    setNewEmail('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Company overview
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization and account access.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <p className="text-sm font-medium text-slate-600">Active Managers</p>
          <p className="text-4xl font-bold text-slate-900 mt-4 tracking-tight">{activeCount}</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <p className="text-sm font-medium text-slate-600">Pending activation</p>
          <p className="text-4xl font-bold text-slate-900 mt-4 tracking-tight">{pendingCount}</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <p className="text-sm font-medium text-slate-600">Account alerts</p>
          <p className="text-4xl font-bold text-slate-900 mt-4 tracking-tight">{alertCount}</p>
        </div>
      </div>

      {/* Action Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            Your organization is ready
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Nova Industries · Workspace NOVA-7K3P
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5542f6] hover:bg-[#4834e0] text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shrink-0"
        >
          Register Manager
        </button>
      </div>

      {/* Recent Activity Table */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-slate-900">
          Recent account activity
        </h2>

        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-[#fafafa]">
              <tr>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Activity
                </th>
                <th className="py-3 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                  When
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-slate-900 text-sm">{log.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{log.role}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-600">{log.activity}</td>
                  <td className="py-4 px-6 text-sm text-slate-400 text-right whitespace-nowrap">
                    {log.when}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Manager */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Register New Manager</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kasun Fernando"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase">
                  Work Email
                </label>
                <input
                  type="email"
                  placeholder="e.g. kasun@nova.example"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5542f6]/20 focus:border-[#5542f6]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-medium bg-[#5542f6] hover:bg-[#4834e0] text-white rounded-xl shadow-xs"
                >
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};